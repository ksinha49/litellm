from litellm.litellm_core_utils.litellm_logging import StandardLoggingPayloadSetup


def test_get_user_agent_tags_truncates_long_user_agent():
    ua = "myclient/" + "a" * 150
    tags = StandardLoggingPayloadSetup._get_user_agent_tags({"headers": {"user-agent": ua}})
    assert tags is not None
    assert tags[0] == "User-Agent: myclient"
    expected = ua[:100]
    assert tags[1] == f"User-Agent: {expected}"
    assert len(expected) == 100


def test_get_user_agent_tags_rejects_malformed_user_agent():
    ua = "\n\n\r\t"
    tags = StandardLoggingPayloadSetup._get_user_agent_tags({"headers": {"user-agent": ua}})
    assert tags is None
