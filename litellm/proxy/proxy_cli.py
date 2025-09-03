# ruff: noqa: T201
import importlib
import json
import os
import random
import subprocess
import sys
import urllib.parse as urlparse
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any, Optional, Union

import click
import httpx
import yaml
from dotenv import load_dotenv

if TYPE_CHECKING:
    from fastapi import FastAPI
else:
    FastAPI = Any

config_filename = "litellm.secrets"

litellm_mode = os.getenv("LITELLM_MODE", "DEV")  # "PRODUCTION", "DEV"
if litellm_mode == "DEV":
    load_dotenv()
from enum import Enum

telemetry = None


class LiteLLMDatabaseConnectionPool(Enum):
    database_connection_pool_limit = 10
    database_connection_pool_timeout = 60


@dataclass
class ProxyConfigOptions:
    """Grouped configuration for starting the proxy server."""

    host: str
    port: int
    config: Optional[str]
    num_workers: Optional[int]
    run_gunicorn: bool
    run_hypercorn: bool
    ssl_keyfile_path: Optional[str]
    ssl_certfile_path: Optional[str]
    ciphers: Optional[str]
    log_config: Optional[str]
    skip_server_startup: bool
    keepalive_timeout: Optional[int]
    detailed_debug: bool = False


def append_query_params(url, params) -> str:
    from litellm._logging import verbose_proxy_logger

    verbose_proxy_logger.debug(f"url: {url}")
    verbose_proxy_logger.debug(f"params: {params}")
    parsed_url = urlparse.urlparse(url)
    parsed_query = urlparse.parse_qs(parsed_url.query)
    parsed_query.update(params)
    encoded_query = urlparse.urlencode(parsed_query, doseq=True)
    modified_url = urlparse.urlunparse(parsed_url._replace(query=encoded_query))
    return modified_url  # type: ignore


class ProxyInitializationHelpers:
    @staticmethod
    def _echo_litellm_version():
        pkg_version = importlib.metadata.version("litellm")  # type: ignore
        click.echo(f"\nLiteLLM: Current Version = {pkg_version}\n")

    @staticmethod
    def _run_health_check(host, port):
        print("\nLiteLLM: Health Testing models in config")  # noqa
        response = httpx.get(url=f"http://{host}:{port}/health")
        print(json.dumps(response.json(), indent=4))  # noqa

    @staticmethod
    def _run_test_chat_completion(
        host: str,
        port: int,
        model: str,
        test: Union[bool, str],
    ):
        request_model = model or "gpt-3.5-turbo"
        click.echo(
            f"\nLiteLLM: Making a test ChatCompletions request to your proxy. Model={request_model}"
        )
        import openai

        api_base = f"http://{host}:{port}"
        if isinstance(test, str):
            api_base = test
        else:
            raise ValueError("Invalid test value")
        client = openai.OpenAI(api_key="My API Key", base_url=api_base)

        response = client.chat.completions.create(
            model=request_model,
            messages=[
                {
                    "role": "user",
                    "content": "this is a test request, write a short poem",
                }
            ],
            max_tokens=256,
        )
        click.echo(f"\nLiteLLM: response from proxy {response}")

        print(  # noqa
            f"\n LiteLLM: Making a test ChatCompletions + streaming r equest to proxy. Model={request_model}"
        )

        stream_response = client.chat.completions.create(
            model=request_model,
            messages=[
                {
                    "role": "user",
                    "content": "this is a test request, write a short poem",
                }
            ],
            stream=True,
        )
        for chunk in stream_response:
            click.echo(f"LiteLLM: streaming response from proxy {chunk}")
        print("\n making completion request to proxy")  # noqa
        completion_response = client.completions.create(
            model=request_model, prompt="this is a test request, write a short poem"
        )
        print(completion_response)  # noqa

    @staticmethod
    def _get_default_unvicorn_init_args(
        host: str,
        port: int,
        log_config: Optional[str] = None,
        keepalive_timeout: Optional[int] = None,
    ) -> dict:
        """
        Get the arguments for `uvicorn` worker
        """
        import litellm

        uvicorn_args = {
            "app": "litellm.proxy.proxy_server:app",
            "host": host,
            "port": port,
        }
        if log_config is not None:
            print(f"Using log_config: {log_config}")  # noqa
            uvicorn_args["log_config"] = log_config
        elif litellm.json_logs:
            print("Using json logs. Setting log_config to None.")  # noqa
            uvicorn_args["log_config"] = None
        if keepalive_timeout is not None:
            uvicorn_args["timeout_keep_alive"] = keepalive_timeout
        return uvicorn_args

    @staticmethod
    def _init_hypercorn_server(
        app: FastAPI,
        host: str,
        port: int,
        ssl_certfile_path: str,
        ssl_keyfile_path: str,
        ciphers: Optional[str] = None,
    ):
        """
        Initialize litellm with `hypercorn`
        """
        import asyncio

        from hypercorn.asyncio import serve
        from hypercorn.config import Config

        print(  # noqa
            f"\033[1;32mLiteLLM Proxy: Starting server on {host}:{port} using Hypercorn\033[0m\n"  # noqa
        )  # noqa
        config = Config()
        config.bind = [f"{host}:{port}"]

        if ssl_certfile_path is not None and ssl_keyfile_path is not None:
            print(  # noqa
                f"\033[1;32mLiteLLM Proxy: Using SSL with certfile: {ssl_certfile_path} and keyfile: {ssl_keyfile_path}\033[0m\n"  # noqa
            )
            config.certfile = ssl_certfile_path
            config.keyfile = ssl_keyfile_path
            if ciphers is not None:
                config.ciphers = ciphers

        # hypercorn serve raises a type warning when passing a fast api app - even though fast API is a valid type
        asyncio.run(serve(app, config))  # type: ignore

    @staticmethod
    def _run_gunicorn_server(
        host: str,
        port: int,
        app: FastAPI,
        num_workers: int,
        ssl_certfile_path: str,
        ssl_keyfile_path: str,
    ):
        """
        Run litellm with `gunicorn`
        """
        if os.name == "nt":
            pass
        else:
            import gunicorn.app.base

        # Gunicorn Application Class
        class StandaloneApplication(gunicorn.app.base.BaseApplication):
            def __init__(self, app, options=None):
                self.options = options or {}  # gunicorn options
                self.application = app  # FastAPI app
                super().__init__()

                _endpoint_str = (
                    f"curl --location 'http://0.0.0.0:{port}/chat/completions' \\"
                )
                curl_command = (
                    _endpoint_str
                    + """
                --header 'Content-Type: application/json' \\
                --data ' {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                    "role": "user",
                    "content": "what llm are you"
                    }
                ]
                }'
                \n
                """
                )
                print()  # noqa
                print(  # noqa
                    '\033[1;34mLiteLLM: Test your local proxy with: "litellm --test" This runs an openai.ChatCompletion request to your proxy [In a new terminal tab]\033[0m\n'
                )
                print(  # noqa
                    f"\033[1;34mLiteLLM: Curl Command Test for your local proxy\n {curl_command} \033[0m\n"
                )
                print(  # noqa
                    "\033[1;34mDocs: https://docs.litellm.ai/docs/simple_proxy\033[0m\n"
                )  # noqa
                print(  # noqa
                    f"\033[1;34mSee all Router/Swagger docs on http://0.0.0.0:{port} \033[0m\n"
                )  # noqa

            def load_config(self):
                # note: This Loads the gunicorn config - has nothing to do with LiteLLM Proxy config
                if self.cfg is not None:
                    config = {
                        key: value
                        for key, value in self.options.items()
                        if key in self.cfg.settings and value is not None
                    }
                else:
                    config = {}
                for key, value in config.items():
                    if self.cfg is not None:
                        self.cfg.set(key.lower(), value)

            def load(self):
                # gunicorn app function
                return self.application

        print(  # noqa
            f"\033[1;32mLiteLLM Proxy: Starting server on {host}:{port} with {num_workers} workers\033[0m\n"  # noqa
        )
        gunicorn_options = {
            "bind": f"{host}:{port}",
            "workers": num_workers,  # default is 1
            "worker_class": "uvicorn.workers.UvicornWorker",
            "preload": True,  # Add the preload flag,
            "accesslog": "-",  # Log to stdout
            "timeout": 600,  # default to very high number, bedrock/anthropic.claude-v2:1 can take 30+ seconds for the 1st chunk to come in
            "access_log_format": '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s',
        }

        if ssl_certfile_path is not None and ssl_keyfile_path is not None:
            print(  # noqa
                f"\033[1;32mLiteLLM Proxy: Using SSL with certfile: {ssl_certfile_path} and keyfile: {ssl_keyfile_path}\033[0m\n"  # noqa
            )
            gunicorn_options["certfile"] = ssl_certfile_path
            gunicorn_options["keyfile"] = ssl_keyfile_path

        StandaloneApplication(app=app, options=gunicorn_options).run()  # Run gunicorn

    @staticmethod
    def _run_ollama_serve():
        try:
            command = ["ollama", "serve"]

            with open(os.devnull, "w") as devnull:
                subprocess.Popen(command, stdout=devnull, stderr=devnull)
        except Exception as e:
            print(  # noqa
                f"""
                LiteLLM Warning: proxy started with `ollama` model\n`ollama serve` failed with Exception{e}. \nEnsure you run `ollama serve`
            """
            )  # noqa

    @staticmethod
    def _is_port_in_use(port):
        import socket

        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(("localhost", port)) == 0

    @staticmethod
    def _get_loop_type():
        """Helper function to determine the event loop type based on platform"""
        if sys.platform in ("win32", "cygwin", "cli"):
            return None  # Let uvicorn choose the default loop on Windows
        return "uvloop"


def load_proxy_config(
    options: ProxyConfigOptions,
    iam_token_db_auth: bool,
    use_prisma_db_push: bool,
):
    """Load proxy configuration from environment or file."""
    from litellm.proxy.proxy_server import KeyManagementSettings, ProxyConfig

    db_connection_pool_limit = 100
    db_connection_timeout = 60
    general_settings = {}

    if iam_token_db_auth:
        from litellm.proxy.auth.rds_iam_token import generate_iam_auth_token

        db_host = os.getenv("DATABASE_HOST")
        db_port = os.getenv("DATABASE_PORT")
        db_user = os.getenv("DATABASE_USER")
        db_name = os.getenv("DATABASE_NAME")
        db_schema = os.getenv("DATABASE_SCHEMA")

        token = generate_iam_auth_token(db_host=db_host, db_port=db_port, db_user=db_user)
        _db_url = f"postgresql://{db_user}:{token}@{db_host}:{db_port}/{db_name}"
        if db_schema:
            _db_url += f"?schema={db_schema}"

        os.environ["DATABASE_URL"] = _db_url
        os.environ["IAM_TOKEN_DB_AUTH"] = "True"

    from litellm.secret_managers.aws_secret_manager import decrypt_env_var

    if os.getenv("USE_AWS_KMS", None) is not None and os.getenv("USE_AWS_KMS") == "True":
        new_env_var = decrypt_env_var()
        for k, v in new_env_var.items():
            os.environ[k] = v

    if options.config is not None:
        try:
            import asyncio
        except Exception:  # pragma: no cover - handled in tests
            raise ImportError("yaml needs to be imported. Run - `pip install 'litellm[proxy]'`")

        proxy_config = ProxyConfig()
        try:
            _config = asyncio.run(
                proxy_config.get_config(config_file_path=options.config)
            )
        except FileNotFoundError:
            click.echo(
                f"LiteLLM Proxy: Config file not found: {options.config}", err=True
            )
            sys.exit(1)
        except yaml.YAMLError as e:
            click.echo(
                f"LiteLLM Proxy: Failed to parse config file {options.config}: {e}",
                err=True,
            )
            sys.exit(1)

        litellm_settings = _config.get("litellm_settings", None)
        if (
            litellm_settings is not None
            and "json_logs" in litellm_settings
            and litellm_settings["json_logs"] is True
        ):
            import litellm

            litellm.json_logs = True
            litellm._turn_on_json()

        general_settings = _config.get("general_settings", {}) or {}
        if general_settings:
            key_management_system = general_settings.get("key_management_system", None)
            proxy_config.initialize_secret_manager(key_management_system)
        key_management_settings = general_settings.get("key_management_settings", None)
        if key_management_settings is not None:
            import litellm

            litellm._key_management_settings = KeyManagementSettings(**key_management_settings)
        database_url = general_settings.get("database_url", None)
        if database_url is None and os.getenv("DATABASE_URL") is None:
            from litellm.proxy.utils import construct_database_url_from_env_vars

            database_url = construct_database_url_from_env_vars()
            if database_url:
                os.environ["DATABASE_URL"] = database_url
        db_connection_pool_limit = general_settings.get(
            "database_connection_pool_limit",
            LiteLLMDatabaseConnectionPool.database_connection_pool_limit.value,
        )
        db_connection_timeout = general_settings.get(
            "database_connection_pool_timeout",
            LiteLLMDatabaseConnectionPool.database_connection_pool_timeout.value,
        )
        if database_url and database_url.startswith("os.environ/"):
            original_dir = os.getcwd()
            sys.path.insert(0, os.path.abspath("../.."))
            import litellm
            from litellm import get_secret_str

            database_url = get_secret_str(database_url, default_value=None)
            os.chdir(original_dir)
        if database_url is not None and isinstance(database_url, str):
            os.environ["DATABASE_URL"] = database_url

    if options.config is None and os.getenv("DATABASE_URL") is None:
        from litellm.proxy.utils import construct_database_url_from_env_vars

        database_url = construct_database_url_from_env_vars()
        if database_url:
            os.environ["DATABASE_URL"] = database_url

    if options.config is None:
        db_connection_pool_limit = (
            LiteLLMDatabaseConnectionPool.database_connection_pool_limit.value
        )
        db_connection_timeout = (
            LiteLLMDatabaseConnectionPool.database_connection_pool_timeout.value
        )

    if os.getenv("DATABASE_URL", None) is not None or os.getenv("DIRECT_URL", None) is not None:
        try:
            from litellm.secret_managers.main import get_secret

            if os.getenv("DATABASE_URL", None) is not None:
                params = {
                    "connection_limit": db_connection_pool_limit,
                    "pool_timeout": db_connection_timeout,
                }
                database_url = get_secret("DATABASE_URL", default_value=None)
                modified_url = append_query_params(database_url, params)
                os.environ["DATABASE_URL"] = modified_url
            if os.getenv("DIRECT_URL", None) is not None:
                params = {
                    "connection_limit": db_connection_pool_limit,
                    "pool_timeout": db_connection_timeout,
                }
                database_url = os.getenv("DIRECT_URL")
                modified_url = append_query_params(database_url, params)
                os.environ["DIRECT_URL"] = modified_url
            subprocess.run(["prisma"], capture_output=True)
            is_prisma_runnable = True
        except FileNotFoundError:
            is_prisma_runnable = False

        if is_prisma_runnable:
            from litellm.proxy.db.check_migration import check_prisma_schema_diff
            from litellm.proxy.db.prisma_client import (
                PrismaManager,
                should_update_prisma_schema,
            )

            if should_update_prisma_schema(
                general_settings.get("disable_prisma_schema_update")
            ) is False:
                check_prisma_schema_diff(db_url=None)
            else:
                PrismaManager.setup_database(use_migrate=not use_prisma_db_push)
        else:
            print(  # noqa: T201
                "Unable to connect to DB. DATABASE_URL found in environment, but prisma package not found."
            )

    return general_settings


def initialize_proxy_server(options: ProxyConfigOptions):
    """Prepare uvicorn arguments and enable debugging if requested."""

    import litellm

    if options.detailed_debug is True:
        litellm._turn_on_debug()

    if options.port == 4000 and ProxyInitializationHelpers._is_port_in_use(options.port):
        options.port = random.randint(1024, 49152)

    uvicorn_args = ProxyInitializationHelpers._get_default_unvicorn_init_args(
        host=options.host,
        port=options.port,
        log_config=options.log_config,
        keepalive_timeout=options.keepalive_timeout,
    )
    return uvicorn_args


def start_proxy_server(app, options: ProxyConfigOptions, uvicorn_args):
    """Start the proxy server using uvicorn, gunicorn, or hypercorn."""

    if options.run_gunicorn and options.run_hypercorn:
        raise ValueError("Cannot enable both gunicorn and hypercorn")

    if options.run_gunicorn is False and options.run_hypercorn is False:
        if options.ssl_certfile_path is not None and options.ssl_keyfile_path is not None:
            print(  # noqa: T201
                f"\033[1;32mLiteLLM Proxy: Using SSL with certfile: {options.ssl_certfile_path} and keyfile: {options.ssl_keyfile_path}\033[0m\n"
            )
            uvicorn_args["ssl_keyfile"] = options.ssl_keyfile_path
            uvicorn_args["ssl_certfile"] = options.ssl_certfile_path

        loop_type = ProxyInitializationHelpers._get_loop_type()
        if loop_type:
            uvicorn_args["loop"] = loop_type

        import uvicorn

        uvicorn.run(**uvicorn_args, workers=options.num_workers)
    elif options.run_gunicorn is True:
        ProxyInitializationHelpers._run_gunicorn_server(
            host=options.host,
            port=options.port,
            app=app,
            num_workers=options.num_workers or 1,
            ssl_certfile_path=options.ssl_certfile_path or "",
            ssl_keyfile_path=options.ssl_keyfile_path or "",
        )
    elif options.run_hypercorn is True:
        ProxyInitializationHelpers._init_hypercorn_server(
            app=app,
            host=options.host,
            port=options.port,
            ssl_certfile_path=options.ssl_certfile_path or "",
            ssl_keyfile_path=options.ssl_keyfile_path or "",
            ciphers=options.ciphers,
        )

@click.command()
@click.option(
    "--host", default="0.0.0.0", help="Host for the server to listen on.", envvar="HOST"
)
@click.option("--port", default=4000, help="Port to bind the server to.", envvar="PORT")
@click.option(
    "--num_workers",
    default=1,
    help="Number of uvicorn / gunicorn workers to spin up. By default, 1 uvicorn is used.",
    envvar="NUM_WORKERS",
)
@click.option("--api_base", default=None, help="API base URL.")
@click.option(
    "--api_version",
    default="2024-07-01-preview",
    help="For azure - pass in the api version.",
)
@click.option(
    "--model", "-m", default=None, help="The model name to pass to litellm expects"
)
@click.option(
    "--alias",
    default=None,
    help='The alias for the model - use this to give a litellm model name (e.g. "huggingface/codellama/CodeLlama-7b-Instruct-hf") a more user-friendly name ("codellama")',
)
@click.option(
    "--add_key", default=None, help="The model name to pass to litellm expects"
)
@click.option("--headers", default=None, help="headers for the API call")
@click.option("--save", is_flag=True, type=bool, help="Save the model-specific config")
@click.option(
    "--debug",
    default=False,
    is_flag=True,
    type=bool,
    help="To debug the input",
    envvar="DEBUG",
)
@click.option(
    "--detailed_debug",
    default=False,
    is_flag=True,
    type=bool,
    help="To view detailed debug logs",
    envvar="DETAILED_DEBUG",
)
@click.option(
    "--use_queue",
    default=False,
    is_flag=True,
    type=bool,
    help="To use celery workers for async endpoints",
)
@click.option(
    "--temperature", default=None, type=float, help="Set temperature for the model"
)
@click.option(
    "--max_tokens", default=None, type=int, help="Set max tokens for the model"
)
@click.option(
    "--request_timeout",
    default=None,
    type=int,
    help="Set timeout in seconds for completion calls",
)
@click.option("--drop_params", is_flag=True, help="Drop any unmapped params")
@click.option(
    "--add_function_to_prompt",
    is_flag=True,
    help="If function passed but unsupported, pass it as prompt",
)
@click.option(
    "--config",
    "-c",
    default=None,
    help="Path to the proxy configuration file (e.g. config.yaml). Usage `litellm --config config.yaml`",
)
@click.option(
    "--max_budget",
    default=None,
    type=float,
    help="Set max budget for API calls - works for hosted models like OpenAI, TogetherAI, Anthropic, etc.`",
)
@click.option(
    "--telemetry",
    default=True,
    type=bool,
    help="Helps us know if people are using this feature. Turn this off by doing `--telemetry False`",
)
@click.option(
    "--log_config",
    default=None,
    type=str,
    help="Path to the logging configuration file",
)
@click.option(
    "--version",
    "-v",
    default=False,
    is_flag=True,
    type=bool,
    help="Print LiteLLM version",
)
@click.option(
    "--health",
    flag_value=True,
    help="Make a chat/completions request to all llms in config.yaml",
)
@click.option(
    "--test",
    flag_value=True,
    help="proxy chat completions url to make a test request to",
)
@click.option(
    "--test_async",
    default=False,
    is_flag=True,
    help="Calls async endpoints /queue/requests and /queue/response",
)
@click.option(
    "--iam_token_db_auth",
    default=False,
    is_flag=True,
    help="Connects to RDS DB with IAM token",
)
@click.option(
    "--num_requests",
    default=10,
    type=int,
    help="Number of requests to hit async endpoint with",
)
@click.option(
    "--run_gunicorn",
    default=False,
    is_flag=True,
    help="Starts proxy via gunicorn, instead of uvicorn (better for managing multiple workers)",
)
@click.option(
    "--run_hypercorn",
    default=False,
    is_flag=True,
    help="Starts proxy via hypercorn, instead of uvicorn (supports HTTP/2)",
)
@click.option(
    "--ssl_keyfile_path",
    default=None,
    type=str,
    help="Path to the SSL keyfile. Use this when you want to provide SSL certificate when starting proxy",
    envvar="SSL_KEYFILE_PATH",
)
@click.option(
    "--ssl_certfile_path",
    default=None,
    type=str,
    help="Path to the SSL certfile. Use this when you want to provide SSL certificate when starting proxy",
    envvar="SSL_CERTFILE_PATH",
)
@click.option(
    "--ciphers",
    default=None,
    type=str,
    help="Ciphers to use for the SSL setup.",
)
@click.option(
    "--use_prisma_db_push",
    is_flag=True,
    default=False,
    help="Use prisma db push instead of prisma migrate for database schema updates",
)
@click.option("--local", is_flag=True, default=False, help="for local debugging")
@click.option(
    "--skip_server_startup",
    is_flag=True,
    default=False,
    help="Skip starting the server after setup (useful for migrations only)",
)
@click.option(
    "--keepalive_timeout",
    default=None,
    type=int,
    help="Set the uvicorn keepalive timeout in seconds (uvicorn timeout_keep_alive parameter)",
    envvar="KEEPALIVE_TIMEOUT",
)
def run_server(  # noqa: PLR0915
    host,
    port,
    api_base,
    api_version,
    model,
    alias,
    add_key,
    headers,
    save,
    debug,
    detailed_debug,
    temperature,
    max_tokens,
    request_timeout,
    drop_params,
    add_function_to_prompt,
    config,
    max_budget,
    telemetry,
    test,
    local,
    num_workers,
    test_async,
    iam_token_db_auth,
    num_requests,
    use_queue,
    health,
    version,
    run_gunicorn,
    run_hypercorn,
    ssl_keyfile_path,
    ssl_certfile_path,
    ciphers,
    log_config,
    use_prisma_db_push: bool,
    skip_server_startup,
    keepalive_timeout,
):
    try:
        from litellm.proxy.proxy_server import app, save_worker_config
    except ImportError as e:
        raise ModuleNotFoundError(
            "Failed to import proxy server. Please install proxy dependencies with "
            "`pip install 'litellm[proxy]'`."
            f" Original error: {e}"
        ) from e

    if local:
        pass  # backwards compatibility
    if version is True:
        ProxyInitializationHelpers._echo_litellm_version()
        return
    if model and "ollama" in model and api_base is None:
        ProxyInitializationHelpers._run_ollama_serve()
    if health is True:
        ProxyInitializationHelpers._run_health_check(host, port)
        return
    if test is True:
        ProxyInitializationHelpers._run_test_chat_completion(host, port, model, test)
        return
    else:
        if headers:
            headers = json.loads(headers)
        save_worker_config(
            model=model,
            alias=alias,
            api_base=api_base,
            api_version=api_version,
            debug=debug,
            detailed_debug=detailed_debug,
            temperature=temperature,
            max_tokens=max_tokens,
            request_timeout=request_timeout,
            max_budget=max_budget,
            telemetry=telemetry,
            drop_params=drop_params,
            add_function_to_prompt=add_function_to_prompt,
            headers=headers,
            save=save,
            config=config,
            use_queue=use_queue,
        )

        options = ProxyConfigOptions(
            host=host,
            port=port,
            config=config,
            num_workers=num_workers,
            run_gunicorn=run_gunicorn,
            run_hypercorn=run_hypercorn,
            ssl_keyfile_path=ssl_keyfile_path,
            ssl_certfile_path=ssl_certfile_path,
            ciphers=ciphers,
            log_config=log_config,
            skip_server_startup=skip_server_startup,
            keepalive_timeout=keepalive_timeout,
            detailed_debug=detailed_debug,
        )

        load_proxy_config(
            options,
            iam_token_db_auth=iam_token_db_auth,
            use_prisma_db_push=use_prisma_db_push,
        )

        uvicorn_args = initialize_proxy_server(options)

        # DO NOT DELETE - enables global variables to work across files
        from litellm.proxy.proxy_server import app  # noqa

        # --- SEPARATE HEALTH APP LOGIC ---
        # To run the health app separately, use:
        #   uvicorn litellm.proxy.health_app_factory:build_health_app --factory --host 0.0.0.0 --port=4001
        # This is compatible with the SEPARATE_HEALTH_APP Docker/supervisord pattern.
        # --- END SEPARATE HEALTH APP LOGIC ---

        if options.skip_server_startup:
            print("LiteLLM: Setup complete. Skipping server startup as requested.")  # noqa: T201
            return

        start_proxy_server(app, options, uvicorn_args)


if __name__ == "__main__":
    run_server()
