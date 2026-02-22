(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,190272,785913,e=>{"use strict";var t,a,s=((t={}).AUDIO_SPEECH="audio_speech",t.AUDIO_TRANSCRIPTION="audio_transcription",t.IMAGE_GENERATION="image_generation",t.VIDEO_GENERATION="video_generation",t.CHAT="chat",t.RESPONSES="responses",t.IMAGE_EDITS="image_edits",t.ANTHROPIC_MESSAGES="anthropic_messages",t.EMBEDDING="embedding",t),r=((a={}).IMAGE="image",a.VIDEO="video",a.CHAT="chat",a.RESPONSES="responses",a.IMAGE_EDITS="image_edits",a.ANTHROPIC_MESSAGES="anthropic_messages",a.EMBEDDINGS="embeddings",a.SPEECH="speech",a.TRANSCRIPTION="transcription",a.A2A_AGENTS="a2a_agents",a.MCP="mcp",a);let i={image_generation:"image",video_generation:"video",chat:"chat",responses:"responses",image_edits:"image_edits",anthropic_messages:"anthropic_messages",audio_speech:"speech",audio_transcription:"transcription",embedding:"embeddings"};e.s(["EndpointType",()=>r,"getEndpointType",0,e=>{if(console.log("getEndpointType:",e),Object.values(s).includes(e)){let t=i[e];return console.log("endpointType:",t),t}return"chat"}],785913),e.s(["generateCodeSnippet",0,e=>{let t,{apiKeySource:a,accessToken:s,apiKey:i,inputMessage:l,chatHistory:n,selectedTags:o,selectedVectorStores:c,selectedGuardrails:d,selectedPolicies:m,selectedMCPServers:p,mcpServers:u,mcpServerToolRestrictions:g,selectedVoice:x,endpointType:h,selectedModel:f,selectedSdk:b,proxySettings:_}=e,y="session"===a?s:i,v=window.location.origin,j=_?.LITELLM_UI_API_DOC_BASE_URL;j&&j.trim()?v=j:_?.PROXY_BASE_URL&&(v=_.PROXY_BASE_URL);let N=l||"Your prompt here",w=N.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n"),S=n.filter(e=>!e.isImage).map(({role:e,content:t})=>({role:e,content:t})),A={};o.length>0&&(A.tags=o),c.length>0&&(A.vector_stores=c),d.length>0&&(A.guardrails=d),m.length>0&&(A.policies=m);let T=f||"your-model-name",C="azure"===b?`import openai

client = openai.AzureOpenAI(
	api_key="${y||"YOUR_LITELLM_API_KEY"}",
	azure_endpoint="${v}",
	api_version="2024-02-01"
)`:`import openai

client = openai.OpenAI(
	api_key="${y||"YOUR_LITELLM_API_KEY"}",
	base_url="${v}"
)`;switch(h){case r.CHAT:{let e=Object.keys(A).length>0,a="";if(e){let e=JSON.stringify({metadata:A},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();a=`,
    extra_body=${e}`}let s=S.length>0?S:[{role:"user",content:N}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.chat.completions.create(
    model="${T}",
    messages=${JSON.stringify(s,null,4)}${a}
)

print(response)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.chat.completions.create(
#     model="${T}",
#     messages=[
#         {
#             "role": "user",
#             "content": [
#                 {
#                     "type": "text",
#                     "text": "${w}"
#                 },
#                 {
#                     "type": "image_url",
#                     "image_url": {
#                         "url": f"data:image/jpeg;base64,{base64_file}"  # or data:application/pdf;base64,{base64_file}
#                     }
#                 }
#             ]
#         }
#     ]${a}
# )
# print(response_with_file)
`;break}case r.RESPONSES:{let e=Object.keys(A).length>0,a="";if(e){let e=JSON.stringify({metadata:A},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();a=`,
    extra_body=${e}`}let s=S.length>0?S:[{role:"user",content:N}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.responses.create(
    model="${T}",
    input=${JSON.stringify(s,null,4)}${a}
)

print(response.output_text)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.responses.create(
#     model="${T}",
#     input=[
#         {
#             "role": "user",
#             "content": [
#                 {"type": "input_text", "text": "${w}"},
#                 {
#                     "type": "input_image",
#                     "image_url": f"data:image/jpeg;base64,{base64_file}",  # or data:application/pdf;base64,{base64_file}
#                 },
#             ],
#         }
#     ]${a}
# )
# print(response_with_file.output_text)
`;break}case r.IMAGE:t="azure"===b?`
# NOTE: The Azure SDK does not have a direct equivalent to the multi-modal 'responses.create' method shown for OpenAI.
# This snippet uses 'client.images.generate' and will create a new image based on your prompt.
# It does not use the uploaded image, as 'client.images.generate' does not support image inputs in this context.
import os
import requests
import json
import time
from PIL import Image

result = client.images.generate(
	model="${T}",
	prompt="${l}",
	n=1
)

json_response = json.loads(result.model_dump_json())

# Set the directory for the stored image
image_dir = os.path.join(os.curdir, 'images')

# If the directory doesn't exist, create it
if not os.path.isdir(image_dir):
	os.mkdir(image_dir)

# Initialize the image path
image_filename = f"generated_image_{int(time.time())}.png"
image_path = os.path.join(image_dir, image_filename)

try:
	# Retrieve the generated image
	if json_response.get("data") && len(json_response["data"]) > 0 && json_response["data"][0].get("url"):
			image_url = json_response["data"][0]["url"]
			generated_image = requests.get(image_url).content
			with open(image_path, "wb") as image_file:
					image_file.write(generated_image)

			print(f"Image saved to {image_path}")
			# Display the image
			image = Image.open(image_path)
			image.show()
	else:
			print("Could not find image URL in response.")
			print("Full response:", json_response)
except Exception as e:
	print(f"An error occurred: {e}")
	print("Full response:", json_response)
`:`
import base64
import os
import time
import json
from PIL import Image
import requests

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# Helper function to create a file (simplified for this example)
def create_file(image_path):
	# In a real implementation, this would upload the file to OpenAI
	# For this example, we'll just return a placeholder ID
	return f"file_{os.path.basename(image_path).replace('.', '_')}"

# The prompt entered by the user
prompt = "${w}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${T}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
							},
							{
									"type": "input_image",
									"file_id": file_id2,
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`;break;case r.IMAGE_EDITS:t="azure"===b?`
import base64
import os
import time
import json
from PIL import Image
import requests

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# The prompt entered by the user
prompt = "${w}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${T}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
							},
							{
									"type": "input_image",
									"file_id": file_id2,
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`:`
import base64
import os
import time

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# Helper function to create a file (simplified for this example)
def create_file(image_path):
	# In a real implementation, this would upload the file to OpenAI
	# For this example, we'll just return a placeholder ID
	return f"file_{os.path.basename(image_path).replace('.', '_')}"

# The prompt entered by the user
prompt = "${w}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${T}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
							},
							{
									"type": "input_image",
									"file_id": file_id2,
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`;break;case r.EMBEDDINGS:t=`
response = client.embeddings.create(
	input="${l||"Your string here"}",
	model="${T}",
	encoding_format="base64" # or "float"
)

print(response.data[0].embedding)
`;break;case r.TRANSCRIPTION:t=`
# Open the audio file
audio_file = open("path/to/your/audio/file.mp3", "rb")

# Make the transcription request
response = client.audio.transcriptions.create(
	model="${T}",
	file=audio_file${l?`,
	prompt="${l.replace(/"/g,'\\"')}"`:""}
)

print(response.text)
`;break;case r.SPEECH:t=`
# Make the text-to-speech request
response = client.audio.speech.create(
	model="${T}",
	input="${l||"Your text to convert to speech here"}",
	voice="${x}"  # Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
)

# Save the audio to a file
output_filename = "output_speech.mp3"
response.stream_to_file(output_filename)
print(f"Audio saved to {output_filename}")

# Optional: Customize response format and speed
# response = client.audio.speech.create(
#     model="${T}",
#     input="${l||"Your text to convert to speech here"}",
#     voice="alloy",
#     response_format="mp3",  # Options: mp3, opus, aac, flac, wav, pcm
#     speed=1.0  # Range: 0.25 to 4.0
# )
# response.stream_to_file("output_speech.mp3")
`;break;default:t="\n# Code generation for this endpoint is not implemented yet."}return`${C}
${t}`}],190272)},928685,e=>{"use strict";var t=e.i(38953);e.s(["SearchOutlined",()=>t.default])},209261,e=>{"use strict";e.s(["extractCategories",0,e=>{let t=new Set;return e.forEach(e=>{e.category&&""!==e.category.trim()&&t.add(e.category)}),["All",...Array.from(t).sort(),"Other"]},"filterPluginsByCategory",0,(e,t)=>"All"===t?e:"Other"===t?e.filter(e=>!e.category||""===e.category.trim()):e.filter(e=>e.category===t),"filterPluginsBySearch",0,(e,t)=>{if(!t||""===t.trim())return e;let a=t.toLowerCase().trim();return e.filter(e=>{let t=e.name.toLowerCase().includes(a),s=e.description?.toLowerCase().includes(a)||!1,r=e.keywords?.some(e=>e.toLowerCase().includes(a))||!1;return t||s||r})},"formatDateString",0,e=>{if(!e)return"N/A";try{return new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}catch(e){return"Invalid date"}},"formatInstallCommand",0,e=>"github"===e.source.source&&e.source.repo?`/plugin marketplace add ${e.source.repo}`:"url"===e.source.source&&e.source.url?`/plugin marketplace add ${e.source.url}`:`/plugin marketplace add ${e.name}`,"getCategoryBadgeColor",0,e=>{if(!e)return"gray";let t=e.toLowerCase();if(t.includes("development")||t.includes("dev"))return"blue";if(t.includes("productivity")||t.includes("workflow"))return"green";if(t.includes("learning")||t.includes("education"))return"purple";if(t.includes("security")||t.includes("safety"))return"red";if(t.includes("data")||t.includes("analytics"))return"orange";else if(t.includes("integration")||t.includes("api"))return"yellow";return"gray"},"getSourceDisplayText",0,e=>"github"===e.source&&e.repo?`GitHub: ${e.repo}`:"url"===e.source&&e.url?e.url:"Unknown source","getSourceLink",0,e=>"github"===e.source&&e.repo?`https://github.com/${e.repo}`:"url"===e.source&&e.url?e.url:null,"isValidEmail",0,e=>!e||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),"isValidSemanticVersion",0,e=>!e||/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(e),"isValidUrl",0,e=>{if(!e)return!0;try{return new URL(e),!0}catch{return!1}},"parseKeywords",0,e=>e&&""!==e.trim()?e.split(",").map(e=>e.trim()).filter(e=>""!==e):[],"validatePluginName",0,e=>!!e&&""!==e.trim()&&/^[a-z0-9-]+$/.test(e)])},916925,e=>{"use strict";var t,a=((t={}).A2A_Agent="A2A Agent",t.AIML="AI/ML API",t.Bedrock="Amazon Bedrock",t.Anthropic="Anthropic",t.AssemblyAI="AssemblyAI",t.SageMaker="AWS SageMaker",t.Azure="Azure",t.Azure_AI_Studio="Azure AI Foundry (Studio)",t.Cerebras="Cerebras",t.Cohere="Cohere",t.Dashscope="Dashscope",t.Databricks="Databricks (Qwen API)",t.DeepInfra="DeepInfra",t.Deepgram="Deepgram",t.Deepseek="Deepseek",t.ElevenLabs="ElevenLabs",t.FalAI="Fal AI",t.FireworksAI="Fireworks AI",t.Google_AI_Studio="Google AI Studio",t.GradientAI="GradientAI",t.Groq="Groq",t.Hosted_Vllm="vllm",t.Infinity="Infinity",t.JinaAI="Jina AI",t.MiniMax="MiniMax",t.MistralAI="Mistral AI",t.Ollama="Ollama",t.OpenAI="OpenAI",t.OpenAI_Compatible="OpenAI-Compatible Endpoints (Together AI, etc.)",t.OpenAI_Text="OpenAI Text Completion",t.OpenAI_Text_Compatible="OpenAI-Compatible Text Completion Models (Together AI, etc.)",t.Openrouter="Openrouter",t.Oracle="Oracle Cloud Infrastructure (OCI)",t.Perplexity="Perplexity",t.RunwayML="RunwayML",t.Sambanova="Sambanova",t.Snowflake="Snowflake",t.TogetherAI="TogetherAI",t.Triton="Triton",t.Vertex_AI="Vertex AI (Anthropic, Gemini, etc.)",t.VolcEngine="VolcEngine",t.Voyage="Voyage AI",t.xAI="xAI",t.SAP="SAP Generative AI Hub",t.Watsonx="Watsonx",t);let s={A2A_Agent:"a2a_agent",AIML:"aiml",OpenAI:"openai",OpenAI_Text:"text-completion-openai",Azure:"azure",Azure_AI_Studio:"azure_ai",Anthropic:"anthropic",Google_AI_Studio:"gemini",Bedrock:"bedrock",Groq:"groq",MiniMax:"minimax",MistralAI:"mistral",Cohere:"cohere",OpenAI_Compatible:"openai",OpenAI_Text_Compatible:"text-completion-openai",Vertex_AI:"vertex_ai",Databricks:"databricks",Dashscope:"dashscope",xAI:"xai",Deepseek:"deepseek",Ollama:"ollama",AssemblyAI:"assemblyai",Cerebras:"cerebras",Sambanova:"sambanova",Perplexity:"perplexity",RunwayML:"runwayml",TogetherAI:"together_ai",Openrouter:"openrouter",Oracle:"oci",Snowflake:"snowflake",FireworksAI:"fireworks_ai",GradientAI:"gradient_ai",Triton:"triton",Deepgram:"deepgram",ElevenLabs:"elevenlabs",FalAI:"fal_ai",SageMaker:"sagemaker_chat",Voyage:"voyage",JinaAI:"jina_ai",VolcEngine:"volcengine",DeepInfra:"deepinfra",Hosted_Vllm:"hosted_vllm",Infinity:"infinity",SAP:"sap",Watsonx:"watsonx"},r="../ui/assets/logos/",i={"A2A Agent":`${r}a2a_agent.png`,"AI/ML API":`${r}aiml_api.svg`,Anthropic:`${r}anthropic.svg`,AssemblyAI:`${r}assemblyai_small.png`,Azure:`${r}microsoft_azure.svg`,"Azure AI Foundry (Studio)":`${r}microsoft_azure.svg`,"Amazon Bedrock":`${r}bedrock.svg`,"AWS SageMaker":`${r}bedrock.svg`,Cerebras:`${r}cerebras.svg`,Cohere:`${r}cohere.svg`,"Databricks (Qwen API)":`${r}databricks.svg`,Dashscope:`${r}dashscope.svg`,Deepseek:`${r}deepseek.svg`,"Fireworks AI":`${r}fireworks.svg`,Groq:`${r}groq.svg`,"Google AI Studio":`${r}google.svg`,vllm:`${r}vllm.png`,Infinity:`${r}infinity.png`,MiniMax:`${r}minimax.svg`,"Mistral AI":`${r}mistral.svg`,Ollama:`${r}ollama.svg`,OpenAI:`${r}openai_small.svg`,"OpenAI Text Completion":`${r}openai_small.svg`,"OpenAI-Compatible Text Completion Models (Together AI, etc.)":`${r}openai_small.svg`,"OpenAI-Compatible Endpoints (Together AI, etc.)":`${r}openai_small.svg`,Openrouter:`${r}openrouter.svg`,"Oracle Cloud Infrastructure (OCI)":`${r}oracle.svg`,Perplexity:`${r}perplexity-ai.svg`,RunwayML:`${r}runwayml.png`,Sambanova:`${r}sambanova.svg`,Snowflake:`${r}snowflake.svg`,TogetherAI:`${r}togetherai.svg`,"Vertex AI (Anthropic, Gemini, etc.)":`${r}google.svg`,xAI:`${r}xai.svg`,GradientAI:`${r}gradientai.svg`,Triton:`${r}nvidia_triton.png`,Deepgram:`${r}deepgram.png`,ElevenLabs:`${r}elevenlabs.png`,"Fal AI":`${r}fal_ai.jpg`,"Voyage AI":`${r}voyage.webp`,"Jina AI":`${r}jina.png`,VolcEngine:`${r}volcengine.png`,DeepInfra:`${r}deepinfra.png`,"SAP Generative AI Hub":`${r}sap.png`};e.s(["Providers",()=>a,"getPlaceholder",0,e=>{if("AI/ML API"===e)return"aiml/flux-pro/v1.1";if("Vertex AI (Anthropic, Gemini, etc.)"===e)return"gemini-pro";if("Anthropic"==e)return"claude-3-opus";if("Amazon Bedrock"==e)return"claude-3-opus";if("AWS SageMaker"==e)return"sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b";else if("Google AI Studio"==e)return"gemini-pro";else if("Azure AI Foundry (Studio)"==e)return"azure_ai/command-r-plus";else if("Azure"==e)return"my-deployment";else if("Oracle Cloud Infrastructure (OCI)"==e)return"oci/xai.grok-4";else if("Snowflake"==e)return"snowflake/mistral-7b";else if("Voyage AI"==e)return"voyage/";else if("Jina AI"==e)return"jina_ai/";else if("VolcEngine"==e)return"volcengine/<any-model-on-volcengine>";else if("DeepInfra"==e)return"deepinfra/<any-model-on-deepinfra>";else if("Fal AI"==e)return"fal_ai/fal-ai/flux-pro/v1.1-ultra";else if("RunwayML"==e)return"runwayml/gen4_turbo";else if("Watsonx"===e)return"watsonx/ibm/granite-3-3-8b-instruct";else return"gpt-3.5-turbo"},"getProviderLogoAndName",0,e=>{if(!e)return{logo:"",displayName:"-"};if("gemini"===e.toLowerCase()){let e="Google AI Studio";return{logo:i[e],displayName:e}}let t=Object.keys(s).find(t=>s[t].toLowerCase()===e.toLowerCase());if(!t)return{logo:"",displayName:e};let r=a[t];return{logo:i[r],displayName:r}},"getProviderModels",0,(e,t)=>{console.log(`Provider key: ${e}`);let a=s[e];console.log(`Provider mapped to: ${a}`);let r=[];return e&&"object"==typeof t&&(Object.entries(t).forEach(([e,t])=>{if(null!==t&&"object"==typeof t&&"litellm_provider"in t){let s=t.litellm_provider;(s===a||"string"==typeof s&&s.includes(a))&&r.push(e)}}),"Cohere"==e&&(console.log("Adding cohere chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"cohere_chat"===t.litellm_provider&&r.push(e)})),"AWS SageMaker"==e&&(console.log("Adding sagemaker chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"sagemaker_chat"===t.litellm_provider&&r.push(e)}))),r},"providerLogoMap",0,i,"provider_map",0,s])},166406,e=>{"use strict";var t=e.i(190144);e.s(["CopyOutlined",()=>t.default])},94629,e=>{"use strict";var t=e.i(271645);let a=t.forwardRef(function(e,a){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:a},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"}))});e.s(["SwitchVerticalIcon",0,a],94629)},798496,e=>{"use strict";var t=e.i(843476),a=e.i(152990),s=e.i(682830),r=e.i(271645),i=e.i(269200),l=e.i(427612),n=e.i(64848),o=e.i(942232),c=e.i(496020),d=e.i(977572),m=e.i(94629),p=e.i(360820),u=e.i(871943);function g({data:e=[],columns:g,isLoading:x=!1,defaultSorting:h=[],pagination:f,onPaginationChange:b,enablePagination:_=!1}){let[y,v]=r.default.useState(h),[j]=r.default.useState("onChange"),[N,w]=r.default.useState({}),[S,A]=r.default.useState({}),T=(0,a.useReactTable)({data:e,columns:g,state:{sorting:y,columnSizing:N,columnVisibility:S,..._&&f?{pagination:f}:{}},columnResizeMode:j,onSortingChange:v,onColumnSizingChange:w,onColumnVisibilityChange:A,..._&&b?{onPaginationChange:b}:{},getCoreRowModel:(0,s.getCoreRowModel)(),getSortedRowModel:(0,s.getSortedRowModel)(),..._?{getPaginationRowModel:(0,s.getPaginationRowModel)()}:{},enableSorting:!0,enableColumnResizing:!0,defaultColumn:{minSize:40,maxSize:500}});return(0,t.jsx)("div",{className:"rounded-lg custom-border relative",children:(0,t.jsx)("div",{className:"overflow-x-auto",children:(0,t.jsx)("div",{className:"relative min-w-full",children:(0,t.jsxs)(i.Table,{className:"[&_td]:py-2 [&_th]:py-2",style:{width:T.getTotalSize(),minWidth:"100%",tableLayout:"fixed"},children:[(0,t.jsx)(l.TableHead,{children:T.getHeaderGroups().map(e=>(0,t.jsx)(c.TableRow,{children:e.headers.map(e=>(0,t.jsxs)(n.TableHeaderCell,{className:`py-1 h-8 relative ${"actions"===e.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.id?120:e.getSize(),position:"actions"===e.id?"sticky":"relative",right:"actions"===e.id?0:"auto"},onClick:e.column.getCanSort()?e.column.getToggleSortingHandler():void 0,children:[(0,t.jsxs)("div",{className:"flex items-center justify-between gap-2",children:[(0,t.jsx)("div",{className:"flex items-center",children:e.isPlaceholder?null:(0,a.flexRender)(e.column.columnDef.header,e.getContext())}),"actions"!==e.id&&e.column.getCanSort()&&(0,t.jsx)("div",{className:"w-4",children:e.column.getIsSorted()?({asc:(0,t.jsx)(p.ChevronUpIcon,{className:"h-4 w-4 text-blue-500"}),desc:(0,t.jsx)(u.ChevronDownIcon,{className:"h-4 w-4 text-blue-500"})})[e.column.getIsSorted()]:(0,t.jsx)(m.SwitchVerticalIcon,{className:"h-4 w-4 text-gray-400"})})]}),e.column.getCanResize()&&(0,t.jsx)("div",{onMouseDown:e.getResizeHandler(),onTouchStart:e.getResizeHandler(),className:`absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none ${e.column.getIsResizing()?"bg-blue-500":"hover:bg-blue-200"}`})]},e.id))},e.id))}),(0,t.jsx)(o.TableBody,{children:x?(0,t.jsx)(c.TableRow,{children:(0,t.jsx)(d.TableCell,{colSpan:g.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"🚅 Loading models..."})})})}):T.getRowModel().rows.length>0?T.getRowModel().rows.map(e=>(0,t.jsx)(c.TableRow,{children:e.getVisibleCells().map(e=>(0,t.jsx)(d.TableCell,{className:`py-0.5 overflow-hidden ${"actions"===e.column.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.column.id?120:e.column.getSize(),position:"actions"===e.column.id?"sticky":"relative",right:"actions"===e.column.id?0:"auto"},children:(0,a.flexRender)(e.column.columnDef.cell,e.getContext())},e.id))},e.id)):(0,t.jsx)(c.TableRow,{children:(0,t.jsx)(d.TableCell,{colSpan:g.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"No models found"})})})})})]})})})})}e.s(["ModelDataTable",()=>g])},347522,e=>{"use strict";var t=e.i(843476),a=e.i(928685),s=e.i(304967),r=e.i(197647),i=e.i(653824),l=e.i(881073),n=e.i(404206),o=e.i(723731),c=e.i(599724),d=e.i(311451),m=e.i(271645),p=e.i(209261),u=e.i(798496),g=e.i(727749),x=e.i(764205),h=e.i(994388),f=e.i(389083),b=e.i(592968),_=e.i(166406);e.s(["default",0,({publicPage:e=!1})=>{let[y,v]=(0,m.useState)(null),[j,N]=(0,m.useState)(!0),[w,S]=(0,m.useState)(""),[A,T]=(0,m.useState)(0);(0,m.useEffect)(()=>{C()},[]);let C=async()=>{N(!0);try{let e=await (0,x.getClaudeCodeMarketplace)();console.log("Claude Code marketplace:",e),v(e)}catch(e){console.error("Error fetching marketplace:",e)}finally{N(!1)}},k=e=>{navigator.clipboard.writeText(e),g.default.success("Copied to clipboard!")},I=(0,m.useMemo)(()=>y?(0,p.extractCategories)(y.plugins):["All"],[y]),M=I[A]||"All",P=(0,m.useMemo)(()=>{if(!y)return[];let e=y.plugins;return e=(0,p.filterPluginsByCategory)(e,M),e=(0,p.filterPluginsBySearch)(e,w)},[y,M,w]),E=(0,m.useMemo)(()=>((e,a=!1)=>[{header:"Plugin Name",accessorKey:"name",enableSorting:!0,sortingFn:"alphanumeric",cell:({row:a})=>{let s=a.original,r=(0,p.formatInstallCommand)(s);return(0,t.jsxs)("div",{className:"space-y-1",children:[(0,t.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,t.jsx)(c.Text,{className:"font-medium text-sm",children:s.name}),(0,t.jsx)(b.Tooltip,{title:"Copy install command",children:(0,t.jsx)(_.CopyOutlined,{onClick:()=>e(r),className:"cursor-pointer text-gray-500 hover:text-blue-500 text-xs"})})]}),(0,t.jsx)("div",{className:"md:hidden",children:(0,t.jsx)(c.Text,{className:"text-xs text-gray-600",children:s.description||"No description"})})]})}},{header:"Description",accessorKey:"description",enableSorting:!0,sortingFn:"alphanumeric",cell:({row:e})=>{let a=e.original;return(0,t.jsx)(c.Text,{className:"text-xs line-clamp-2",children:a.description||"-"})},meta:{className:"hidden md:table-cell"}},{header:"Version",accessorKey:"version",enableSorting:!0,sortingFn:"alphanumeric",cell:({row:e})=>{let a=e.original;return a.version?(0,t.jsxs)(f.Badge,{color:"blue",size:"sm",children:["v",a.version]}):(0,t.jsx)(c.Text,{className:"text-xs text-gray-400",children:"-"})},meta:{className:"hidden lg:table-cell"}},{header:"Category",accessorKey:"category",enableSorting:!0,sortingFn:"alphanumeric",cell:({row:e})=>{let a=e.original,s=(0,p.getCategoryBadgeColor)(a.category);return a.category?(0,t.jsx)(f.Badge,{color:s,size:"sm",children:a.category}):(0,t.jsx)(f.Badge,{color:"gray",size:"sm",children:"Uncategorized"})},meta:{className:"hidden lg:table-cell"}},{header:"Source",accessorKey:"source",enableSorting:!1,cell:({row:e})=>{let a=e.original,s=(0,p.getSourceDisplayText)(a.source);return(0,t.jsx)(c.Text,{className:"text-xs text-gray-600",children:s})},meta:{className:"hidden xl:table-cell"}},{header:"Keywords",accessorKey:"keywords",enableSorting:!1,cell:({row:e})=>{let a=e.original,s=a.keywords?.slice(0,3)||[],r=(a.keywords?.length||0)-3;return(0,t.jsxs)("div",{className:"flex flex-wrap gap-1",children:[s.map((e,a)=>(0,t.jsx)(f.Badge,{color:"gray",size:"xs",children:e},a)),r>0&&(0,t.jsxs)(f.Badge,{color:"gray",size:"xs",children:["+",r]})]})},meta:{className:"hidden xl:table-cell"}},{header:"Install Command",id:"install_command",enableSorting:!1,cell:({row:a})=>{let s=a.original,r=(0,p.formatInstallCommand)(s);return(0,t.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,t.jsx)("code",{className:"text-xs bg-gray-100 px-2 py-1 rounded font-mono truncate max-w-[200px]",children:r}),(0,t.jsx)(b.Tooltip,{title:"Copy command",children:(0,t.jsx)(h.Button,{size:"xs",variant:"secondary",icon:_.CopyOutlined,onClick:()=>e(r)})})]})}}])(k,e),[e]);return y||j?(0,t.jsxs)("div",{className:"space-y-4",children:[(0,t.jsx)("div",{className:"max-w-md",children:(0,t.jsx)(d.Input,{placeholder:"Search plugins by name, description, or keywords...",prefix:(0,t.jsx)(a.SearchOutlined,{className:"text-gray-400"}),value:w,onChange:e=>S(e.target.value),allowClear:!0,size:"large"})}),(0,t.jsxs)(i.TabGroup,{index:A,onIndexChange:T,children:[(0,t.jsx)(l.TabList,{className:"mb-4",children:I.map(e=>{let a=(0,p.filterPluginsByCategory)(y?.plugins||[],e),s=(0,p.filterPluginsBySearch)(a,w).length;return(0,t.jsxs)(r.Tab,{children:[e," ",s>0&&`(${s})`]},e)})}),(0,t.jsx)(o.TabPanels,{children:I.map(e=>(0,t.jsxs)(n.TabPanel,{children:[(0,t.jsx)(s.Card,{children:(0,t.jsx)(u.ModelDataTable,{columns:E,data:P,isLoading:j,defaultSorting:[{id:"name",desc:!1}]})}),(0,t.jsx)("div",{className:"mt-4 text-center space-y-2",children:(0,t.jsxs)(c.Text,{className:"text-sm text-gray-600",children:["Showing ",P.length," of"," ",y?.plugins.length||0," plugin",y?.plugins.length!==1?"s":"",w&&` matching "${w}"`,"All"!==M&&` in ${M}`]})})]},e))})]})]}):(0,t.jsx)(s.Card,{children:(0,t.jsx)("div",{className:"text-center p-12",children:(0,t.jsx)(c.Text,{className:"text-gray-500",children:"Failed to load marketplace. Please try again later."})})})}],347522)},93826,174886,879664,952571,e=>{"use strict";var t=e.i(271645);let a=t.forwardRef(function(e,a){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:a},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"}))});e.s(["SearchIcon",0,a],93826);var s=e.i(991124);e.s(["Copy",()=>s.default],174886);let r=(0,e.i(475254).default)("info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);e.s(["default",()=>r],879664),e.s(["Info",()=>r],952571)},976883,e=>{"use strict";var t=e.i(247167),a=e.i(843476),s=e.i(275144),r=e.i(434626),i=e.i(93826),l=e.i(994388),n=e.i(304967),o=e.i(599724),c=e.i(629569),d=e.i(212931),m=e.i(199133),p=e.i(653496),u=e.i(262218),g=e.i(592968),x=e.i(174886),h=e.i(952571),f=e.i(271645),b=e.i(798496),_=e.i(727749),y=e.i(402874),v=e.i(347522),j=e.i(764205),N=e.i(190272),w=e.i(785913),S=e.i(916925);let{TabPane:A}=p.Tabs,T=t.default.env.NEXT_PUBLIC_APP_NAME||"Ameritas LLM",C=`Ameritas has built a centralized AI Services Hub providing every team with consistent, secure, and scalable access to generative AI. A unified API abstracts multiple language models while automatically managing authentication, budget controls, rate limits, and observability — so developers focus on building features, not managing infrastructure.

Across the enterprise, the hub powers document summarization, customer-service automation, knowledge retrieval, and model experimentation. Teams onboard new models without modifying existing code, while governance teams maintain full visibility into usage and cost. This shared platform transforms AI into an enterprise-wide capability — accelerating innovation while preserving compliance and operational control.`;e.s(["default",0,({accessToken:e,isEmbedded:t=!1})=>{let k,I,M,P,E,O,$,[L,z]=(0,f.useState)(null),[R,D]=(0,f.useState)(null),[H,F]=(0,f.useState)(null),[G,K]=(0,f.useState)(`${T} Gateway`),[U,B]=(0,f.useState)(C),[V,W]=(0,f.useState)(""),[q,Y]=(0,f.useState)({}),[J,X]=(0,f.useState)(!0),[Z,Q]=(0,f.useState)(!0),[ee,et]=(0,f.useState)(!0),[ea,es]=(0,f.useState)(""),[er,ei]=(0,f.useState)(""),[el,en]=(0,f.useState)(""),[eo,ec]=(0,f.useState)([]),[ed,em]=(0,f.useState)([]),[ep,eu]=(0,f.useState)([]),[eg,ex]=(0,f.useState)([]),[eh,ef]=(0,f.useState)([]),[eb,e_]=(0,f.useState)("I'm alive! ✓"),[ey,ev]=(0,f.useState)(!1),[ej,eN]=(0,f.useState)(!1),[ew,eS]=(0,f.useState)(!1),[eA,eT]=(0,f.useState)(null),[eC,ek]=(0,f.useState)(null),[eI,eM]=(0,f.useState)(null),[eP,eE]=(0,f.useState)({}),[eO,e$]=(0,f.useState)("models");(0,f.useEffect)(()=>{(async()=>{try{await (0,j.getUiConfig)()}catch(e){console.error("Failed to get UI config:",e)}let e=async()=>{try{X(!0);let e=await (0,j.modelHubPublicModelsCall)();console.log("ModelHubData:",e),z(e)}catch(e){console.error("There was an error fetching the public model data",e),e_("Service unavailable")}finally{X(!1)}},t=async()=>{try{Q(!0);let e=await (0,j.agentHubPublicModelsCall)();console.log("AgentHubData:",e),D(e)}catch(e){console.error("There was an error fetching the public agent data",e)}finally{Q(!1)}},a=async()=>{try{et(!0);let e=await (0,j.mcpHubPublicServersCall)();console.log("MCPHubData:",e),F(e)}catch(e){console.error("There was an error fetching the public MCP server data",e)}finally{et(!1)}};(async()=>{let e=await (0,j.getPublicModelHubInfo)();console.log("Public Model Hub Info:",e),K(e.docs_title),B(e.custom_docs_description||C),W(e.litellm_version),Y(e.useful_links||{})})(),e(),t(),a()})()},[]),(0,f.useEffect)(()=>{},[ea,eo,ed,ep]);let eL=(0,f.useMemo)(()=>{if(!L||!Array.isArray(L))return[];let e=L;if(ea.trim()){let t=ea.toLowerCase(),a=t.split(/\s+/),s=L.filter(e=>{let s=e.model_group.toLowerCase();return!!s.includes(t)||a.every(e=>s.includes(e))});s.length>0&&(e=s.sort((e,a)=>{let s=e.model_group.toLowerCase(),r=a.model_group.toLowerCase(),i=1e3*(s===t),l=1e3*(r===t),n=100*!!s.startsWith(t),o=100*!!r.startsWith(t),c=50*!!t.split(/\s+/).every(e=>s.includes(e)),d=50*!!t.split(/\s+/).every(e=>r.includes(e)),m=s.length;return l+o+d+(1e3-r.length)-(i+n+c+(1e3-m))}))}return e.filter(e=>{let t=0===eo.length||eo.some(t=>e.providers?.includes(t)),a=0===ed.length||ed.includes(e.mode||""),s=0===ep.length||Object.entries(e).filter(([e,t])=>e.startsWith("supports_")&&!0===t).some(([e])=>{let t=e.replace(/^supports_/,"").split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");return ep.includes(t)});return t&&a&&s})},[L,ea,eo,ed,ep]),ez=(0,f.useMemo)(()=>{if(!R||!Array.isArray(R))return[];let e=R;if(er.trim()){let t=er.toLowerCase(),a=t.split(/\s+/);e=(e=R.filter(e=>{let s=e.name.toLowerCase(),r=e.description.toLowerCase();return!!(s.includes(t)||r.includes(t))||a.every(e=>s.includes(e)||r.includes(e))})).sort((e,a)=>{let s=e.name.toLowerCase(),r=a.name.toLowerCase(),i=1e3*(s===t),l=1e3*(r===t),n=100*!!s.startsWith(t),o=100*!!r.startsWith(t),c=i+n+(1e3-s.length);return l+o+(1e3-r.length)-c})}return e.filter(e=>0===eg.length||e.skills?.some(e=>e.tags?.some(e=>eg.includes(e))))},[R,er,eg]),eR=(0,f.useMemo)(()=>{if(!H||!Array.isArray(H))return[];let e=H;if(el.trim()){let t=el.toLowerCase(),a=t.split(/\s+/);e=(e=H.filter(e=>{let s=e.server_name.toLowerCase(),r=(e.mcp_info?.description||"").toLowerCase();return!!(s.includes(t)||r.includes(t))||a.every(e=>s.includes(e)||r.includes(e))})).sort((e,a)=>{let s=e.server_name.toLowerCase(),r=a.server_name.toLowerCase(),i=1e3*(s===t),l=1e3*(r===t),n=100*!!s.startsWith(t),o=100*!!r.startsWith(t),c=i+n+(1e3-s.length);return l+o+(1e3-r.length)-c})}return e.filter(e=>0===eh.length||eh.includes(e.transport))},[H,el,eh]),eD=e=>{navigator.clipboard.writeText(e),_.default.success("Copied to clipboard!")},eH=e=>e.replace(/^supports_/,"").split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" "),eF=e=>`$${(1e6*e).toFixed(4)}`,eG=e=>e?e>=1e3?`${(e/1e3).toFixed(0)}K`:e.toString():"N/A";return(0,a.jsx)(s.ThemeProvider,{accessToken:e,children:(0,a.jsxs)("div",{className:t?"w-full":"min-h-screen bg-white",children:[!t&&(0,a.jsx)(y.default,{userID:null,userEmail:null,userRole:null,premiumUser:!1,setProxySettings:eE,proxySettings:eP,accessToken:e||null,isPublicPage:!0,isDarkMode:!1,toggleDarkMode:()=>{}}),(0,a.jsxs)("div",{className:t?"w-full p-6":"w-full px-8 py-12",children:[t&&(0,a.jsx)("div",{className:"mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg",children:(0,a.jsx)("p",{className:"text-sm text-gray-700",children:"These are models, agents, and MCP servers your proxy admin has indicated are available in your company."})}),!t&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("style",{children:`
                @keyframes ameritasGradient {
                  0%   { background-position: 0% 50%; }
                  25%  { background-position: 50% 100%; }
                  50%  { background-position: 100% 50%; }
                  75%  { background-position: 50% 0%; }
                  100% { background-position: 0% 50%; }
                }
                @keyframes floatOrb1 {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  33%      { transform: translate(60px, -40px) scale(1.1); }
                  66%      { transform: translate(-30px, 30px) scale(0.95); }
                }
                @keyframes floatOrb2 {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  33%      { transform: translate(-50px, 50px) scale(1.05); }
                  66%      { transform: translate(40px, -20px) scale(0.9); }
                }
                @keyframes floatOrb3 {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  50%      { transform: translate(30px, 40px) scale(1.08); }
                }
                @keyframes shimmer {
                  0%   { opacity: 0.03; transform: translateX(-100%); }
                  50%  { opacity: 0.08; }
                  100% { opacity: 0.03; transform: translateX(100%); }
                }
              `}),(0,a.jsxs)("div",{className:"mb-8 relative overflow-hidden",style:{background:"linear-gradient(135deg, #0758ac 0%, #377dd0 25%, #0058db 50%, #b20d15 85%, #d3222a 100%)",backgroundSize:"400% 400%",animation:"ameritasGradient 12s ease infinite",borderRadius:"0px",minHeight:"280px"},children:[(0,a.jsx)("div",{style:{position:"absolute",top:"-60px",right:"10%",width:"300px",height:"300px",background:"radial-gradient(circle, rgba(183,217,243,0.18) 0%, transparent 70%)",borderRadius:"50%",animation:"floatOrb1 16s ease-in-out infinite",pointerEvents:"none"}}),(0,a.jsx)("div",{style:{position:"absolute",bottom:"-40px",left:"5%",width:"250px",height:"250px",background:"radial-gradient(circle, rgba(211,34,42,0.12) 0%, transparent 70%)",borderRadius:"50%",animation:"floatOrb2 20s ease-in-out infinite",pointerEvents:"none"}}),(0,a.jsx)("div",{style:{position:"absolute",top:"30%",right:"30%",width:"180px",height:"180px",background:"radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",borderRadius:"50%",animation:"floatOrb3 14s ease-in-out infinite",pointerEvents:"none"}}),(0,a.jsx)("div",{style:{position:"absolute",inset:0,pointerEvents:"none",background:"linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",animation:"shimmer 8s ease-in-out infinite"}}),(0,a.jsxs)("svg",{style:{position:"absolute",bottom:0,left:0,width:"100%",height:"60px",pointerEvents:"none"},viewBox:"0 0 1440 60",preserveAspectRatio:"none",children:[(0,a.jsx)("path",{d:"M0,40 C360,10 720,55 1080,25 C1260,12 1380,30 1440,20 L1440,60 L0,60 Z",fill:"rgba(255,255,255,0.06)"}),(0,a.jsx)("path",{d:"M0,45 C320,20 640,55 960,30 C1200,15 1360,40 1440,35 L1440,60 L0,60 Z",fill:"rgba(255,255,255,0.04)"})]}),(0,a.jsxs)("div",{className:"relative px-8 py-12",style:{zIndex:1},children:[(0,a.jsx)("h1",{className:"text-white font-semibold mb-3",style:{fontSize:"40px",lineHeight:"54px",fontFamily:"'Century Gothic', 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",letterSpacing:"-0.02em"},children:"AI Services Hub"}),(0,a.jsx)("p",{className:"text-white mb-6",style:{fontSize:"20px",lineHeight:"30px",opacity:.9,fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:"Enterprise-wide access to generative AI — secure, observable, and built to scale."}),(0,a.jsx)("div",{className:"flex flex-wrap gap-3 mb-8",children:[{label:"Models",count:L?.length??"—"},{label:"Agents",count:R?.length??"—"},{label:"MCP Servers",count:H?.length??"—"}].map(({label:e,count:t})=>(0,a.jsxs)("span",{className:"text-white text-sm font-medium px-4 py-1",style:{backgroundColor:"rgba(255,255,255,0.15)",backdropFilter:"blur(4px)",borderRadius:"9999px",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:[t," ",e]},e))}),(0,a.jsxs)("div",{className:"flex flex-wrap gap-4",children:[(0,a.jsx)("a",{href:"/docs",className:"text-sm font-medium px-6 py-2 transition-all",style:{border:"2px solid rgba(255,255,255,0.8)",color:"#ffffff",borderRadius:"9999px",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",textDecoration:"none",backdropFilter:"blur(4px)",transition:"all 0.3s ease"},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#ffffff",e.currentTarget.style.color="#0758ac",e.currentTarget.style.borderColor="#ffffff"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="transparent",e.currentTarget.style.color="#ffffff",e.currentTarget.style.borderColor="rgba(255,255,255,0.8)"},children:"View API Docs"}),(0,a.jsx)("a",{href:"/ui/analytics",className:"text-sm font-medium px-6 py-2 transition-all",style:{border:"2px solid rgba(255,255,255,0.8)",color:"#ffffff",borderRadius:"9999px",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",textDecoration:"none",backdropFilter:"blur(4px)",transition:"all 0.3s ease"},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#ffffff",e.currentTarget.style.color="#0758ac",e.currentTarget.style.borderColor="#ffffff"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="transparent",e.currentTarget.style.color="#ffffff",e.currentTarget.style.borderColor="rgba(255,255,255,0.8)"},children:"AI Analytics"}),(0,a.jsx)("a",{href:"/ui",className:"text-sm font-medium px-6 py-2 transition-all",style:{backgroundColor:"#ffffff",color:"#0758ac",borderRadius:"9999px",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",textDecoration:"none",transition:"all 0.3s ease"},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#e1f3ff",e.currentTarget.style.color="#0758ac"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="#ffffff",e.currentTarget.style.color="#0758ac"},children:"Open Console"})]})]})]}),(0,a.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",children:[{icon:"🔌",title:"Unified API",body:"One endpoint for any model — no per-team integration work."},{icon:"🔒",title:"Governance & Compliance",body:"Budget controls, SSO, and full audit logs built in."},{icon:"📊",title:"Full Observability",body:"Real-time usage, cost, and latency across every team."}].map(({icon:e,title:t,body:s})=>(0,a.jsxs)("div",{className:"bg-white p-6",style:{borderRadius:"0px",boxShadow:"0 3px 4px 1px rgba(0,0,0,.1)",borderLeft:"4px solid #377dd0"},children:[(0,a.jsx)("div",{className:"text-2xl mb-3",children:e}),(0,a.jsx)("h5",{className:"font-semibold mb-2",style:{fontSize:"20px",lineHeight:"30px",color:"#333333",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:t}),(0,a.jsx)("p",{style:{fontSize:"16px",lineHeight:"24px",color:"#595959",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:s})]},t))})]}),!t&&(0,a.jsxs)("div",{className:"mb-8 bg-white p-8",style:{borderRadius:"0px",boxShadow:"0 3px 4px 1px rgba(0,0,0,.1)",borderLeft:"4px solid #377dd0"},children:[(0,a.jsx)("h2",{className:"font-semibold mb-5",style:{fontSize:"32px",lineHeight:"46px",color:"#363636",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:"About"}),(0,a.jsx)("p",{className:"mb-6 whitespace-pre-line",style:{fontSize:"16px",lineHeight:"24px",color:"#595959",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:U}),V&&(0,a.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,a.jsxs)("span",{className:"inline-flex items-center px-3 py-1 text-sm font-medium text-white",style:{backgroundColor:"#377dd0",borderRadius:"9999px",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:["v",V]}),(0,a.jsxs)("span",{style:{fontSize:"14px",color:"#767676"},children:["Powered by ",T]})]})]}),q&&Object.keys(q).length>0&&(0,a.jsxs)("div",{className:"mb-8 bg-white p-8",style:{borderRadius:"0px",boxShadow:"0 3px 4px 1px rgba(0,0,0,.1)"},children:[(0,a.jsx)("h2",{className:"font-semibold mb-5",style:{fontSize:"32px",lineHeight:"46px",color:"#363636",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:"Useful Links"}),(0,a.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:Object.entries(q||{}).map(([e,t])=>({title:e,url:"string"==typeof t?t:t.url,index:"string"==typeof t?0:t.index??0})).sort((e,t)=>e.index-t.index).map(({title:e,url:t})=>(0,a.jsxs)("button",{onClick:()=>window.open(t,"_blank"),className:"flex items-center space-x-3 transition-colors p-3 border",style:{borderRadius:"9999px",borderColor:"#cccccc",color:"#377dd0",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#f0f6fc"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="transparent"},children:[(0,a.jsx)(r.ExternalLinkIcon,{className:"w-4 h-4"}),(0,a.jsx)(o.Text,{className:"text-sm font-medium",children:e})]},e))})]}),!t&&(0,a.jsxs)(n.Card,{className:"mb-10 p-8 bg-white border border-gray-200 rounded-lg shadow-sm",children:[(0,a.jsx)(c.Title,{className:"text-2xl font-semibold mb-6 text-gray-900",children:"Health and Endpoint Status"}),(0,a.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:(0,a.jsxs)(o.Text,{className:"text-green-600 font-medium text-sm",children:["Service status: ",eb]})})]}),(0,a.jsx)(n.Card,{className:"p-8 bg-white border border-gray-200 rounded-lg shadow-sm",children:(0,a.jsxs)(p.Tabs,{activeKey:eO,onChange:e$,size:"large",className:"public-hub-tabs",children:[(0,a.jsxs)(A,{tab:"Model Hub",children:[(0,a.jsx)("div",{className:"flex justify-between items-center mb-8",children:(0,a.jsx)(c.Title,{className:"text-2xl font-semibold text-gray-900",children:"Available Models"})}),(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)("div",{className:"flex items-center space-x-2 mb-3",children:[(0,a.jsx)(o.Text,{className:"text-sm font-medium text-gray-700",children:"Search Models:"}),(0,a.jsx)(g.Tooltip,{title:"Smart search with relevance ranking - finds models containing your search terms, ranked by relevance. Try searching 'xai grok-4', 'claude-4', 'gpt-4', or 'sonnet'",placement:"top",children:(0,a.jsx)(h.Info,{className:"w-4 h-4 text-gray-400 cursor-help"})})]}),(0,a.jsxs)("div",{className:"relative",children:[(0,a.jsx)(i.SearchIcon,{className:"w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"}),(0,a.jsx)("input",{type:"text",placeholder:"Search model names... (smart search enabled)",value:ea,onChange:e=>es(e.target.value),className:"border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"})]})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-sm font-medium mb-3 text-gray-700",children:"Provider:"}),(0,a.jsx)(m.Select,{mode:"multiple",value:eo,onChange:e=>ec(e),placeholder:"Select providers",className:"w-full",size:"large",allowClear:!0,optionRender:e=>{let{logo:t}=(0,S.getProviderLogoAndName)(e.value);return(0,a.jsxs)("div",{className:"flex items-center space-x-2",children:[t&&(0,a.jsx)("img",{src:t,alt:e.label,className:"w-5 h-5 flex-shrink-0 object-contain",onError:e=>{e.target.style.display="none"}}),(0,a.jsx)("span",{className:"capitalize",children:e.label})]})},children:L&&Array.isArray(L)&&(k=new Set,L.forEach(e=>{e.providers.forEach(e=>k.add(e))}),Array.from(k)).map(e=>(0,a.jsx)(m.Select.Option,{value:e,children:e},e))})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-sm font-medium mb-3 text-gray-700",children:"Mode:"}),(0,a.jsx)(m.Select,{mode:"multiple",value:ed,onChange:e=>em(e),placeholder:"Select modes",className:"w-full",size:"large",allowClear:!0,children:L&&Array.isArray(L)&&(I=new Set,L.forEach(e=>{e.mode&&I.add(e.mode)}),Array.from(I)).map(e=>(0,a.jsx)(m.Select.Option,{value:e,children:e},e))})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-sm font-medium mb-3 text-gray-700",children:"Features:"}),(0,a.jsx)(m.Select,{mode:"multiple",value:ep,onChange:e=>eu(e),placeholder:"Select features",className:"w-full",size:"large",allowClear:!0,children:L&&Array.isArray(L)&&(M=new Set,L.forEach(e=>{Object.entries(e).filter(([e,t])=>e.startsWith("supports_")&&!0===t).forEach(([e])=>{let t=e.replace(/^supports_/,"").split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");M.add(t)})}),Array.from(M).sort()).map(e=>(0,a.jsx)(m.Select.Option,{value:e,children:e},e))})]})]}),(0,a.jsx)(b.ModelDataTable,{columns:[{header:"Model Name",accessorKey:"model_group",enableSorting:!0,cell:({row:e})=>(0,a.jsx)("div",{className:"overflow-hidden",children:(0,a.jsx)(g.Tooltip,{title:e.original.model_group,children:(0,a.jsx)(l.Button,{size:"xs",variant:"light",className:"font-mono text-blue-500 bg-blue-50 hover:bg-blue-100 text-xs font-normal px-2 py-0.5 text-left",onClick:()=>{eT(e.original),ev(!0)},children:e.original.model_group})})}),size:150},{header:"Providers",accessorKey:"providers",enableSorting:!0,cell:({row:e})=>{let t=e.original.providers;return(0,a.jsx)("div",{className:"flex flex-wrap gap-1",children:t.map(e=>{let{logo:t}=(0,S.getProviderLogoAndName)(e);return(0,a.jsxs)("div",{className:"flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs",children:[t&&(0,a.jsx)("img",{src:t,alt:e,className:"w-3 h-3 flex-shrink-0 object-contain",onError:e=>{e.target.style.display="none"}}),(0,a.jsx)("span",{className:"capitalize",children:e})]},e)})})},size:120},{header:"Mode",accessorKey:"mode",enableSorting:!0,cell:({row:e})=>{let t=e.original.mode;return(0,a.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,a.jsx)("span",{children:(e=>{switch(e?.toLowerCase()){case"chat":return"💬";case"rerank":return"🔄";case"embedding":return"📄";default:return"🤖"}})(t||"")}),(0,a.jsx)(o.Text,{children:t||"Chat"})]})},size:100},{header:"Max Input",accessorKey:"max_input_tokens",enableSorting:!0,cell:({row:e})=>(0,a.jsx)(o.Text,{className:"text-center",children:eG(e.original.max_input_tokens)}),size:100,meta:{className:"text-center"}},{header:"Max Output",accessorKey:"max_output_tokens",enableSorting:!0,cell:({row:e})=>(0,a.jsx)(o.Text,{className:"text-center",children:eG(e.original.max_output_tokens)}),size:100,meta:{className:"text-center"}},{header:"Input $/1M",accessorKey:"input_cost_per_token",enableSorting:!0,cell:({row:e})=>{let t=e.original.input_cost_per_token;return(0,a.jsx)(o.Text,{className:"text-center",children:t?eF(t):"Free"})},size:100,meta:{className:"text-center"}},{header:"Output $/1M",accessorKey:"output_cost_per_token",enableSorting:!0,cell:({row:e})=>{let t=e.original.output_cost_per_token;return(0,a.jsx)(o.Text,{className:"text-center",children:t?eF(t):"Free"})},size:100,meta:{className:"text-center"}},{header:"Features",accessorKey:"supports_vision",enableSorting:!1,cell:({row:e})=>{let t=Object.entries(e.original).filter(([e,t])=>e.startsWith("supports_")&&!0===t).map(([e])=>eH(e));return 0===t.length?(0,a.jsx)(o.Text,{className:"text-gray-400",children:"-"}):1===t.length?(0,a.jsx)("div",{className:"h-6 flex items-center",children:(0,a.jsx)(u.Tag,{color:"blue",className:"text-xs",children:t[0]})}):(0,a.jsxs)("div",{className:"h-6 flex items-center space-x-1",children:[(0,a.jsx)(u.Tag,{color:"blue",className:"text-xs",children:t[0]}),(0,a.jsx)(g.Tooltip,{title:(0,a.jsxs)("div",{className:"space-y-1",children:[(0,a.jsx)("div",{className:"font-medium",children:"All Features:"}),t.map((e,t)=>(0,a.jsxs)("div",{className:"text-xs",children:["• ",e]},t))]}),trigger:"click",placement:"topLeft",children:(0,a.jsxs)("span",{className:"text-xs text-blue-600 cursor-pointer hover:text-blue-800 hover:underline",onClick:e=>e.stopPropagation(),children:["+",t.length-1]})})]})},size:120},{header:"Health Status",accessorKey:"health_status",enableSorting:!0,cell:({row:e})=>{let t=e.original,s="healthy"===t.health_status?"green":"unhealthy"===t.health_status?"red":"default",r=t.health_response_time?`Response Time: ${Number(t.health_response_time).toFixed(2)}ms`:"N/A",i=t.health_checked_at?`Last Checked: ${new Date(t.health_checked_at).toLocaleString()}`:"N/A";return(0,a.jsx)(g.Tooltip,{title:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{children:r}),(0,a.jsx)("div",{children:i})]}),children:(0,a.jsx)(u.Tag,{color:s,children:(0,a.jsx)("span",{className:"capitalize",children:t.health_status??"Unknown"})},t.model_group)})},size:100},{header:"Limits",accessorKey:"rpm",enableSorting:!0,cell:({row:e})=>{var t,s;let r,i=e.original;return(0,a.jsx)(o.Text,{className:"text-xs text-gray-600",children:(t=i.rpm,s=i.tpm,r=[],t&&r.push(`RPM: ${t.toLocaleString()}`),s&&r.push(`TPM: ${s.toLocaleString()}`),r.length>0?r.join(", "):"N/A")})},size:150}],data:eL,isLoading:J,defaultSorting:[{id:"model_group",desc:!1}]}),(0,a.jsx)("div",{className:"mt-8 text-center",children:(0,a.jsxs)(o.Text,{className:"text-sm text-gray-600",children:["Showing ",eL.length," of ",L?.length||0," models"]})})]},"models"),(0,a.jsxs)(A,{tab:"Agent Hub",children:[(0,a.jsx)("div",{className:"flex justify-between items-center mb-8",children:(0,a.jsx)(c.Title,{className:"text-2xl font-semibold text-gray-900",children:"Available Agents"})}),(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)("div",{className:"flex items-center space-x-2 mb-3",children:[(0,a.jsx)(o.Text,{className:"text-sm font-medium text-gray-700",children:"Search Agents:"}),(0,a.jsx)(g.Tooltip,{title:"Search agents by name or description",placement:"top",children:(0,a.jsx)(h.Info,{className:"w-4 h-4 text-gray-400 cursor-help"})})]}),(0,a.jsxs)("div",{className:"relative",children:[(0,a.jsx)(i.SearchIcon,{className:"w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"}),(0,a.jsx)("input",{type:"text",placeholder:"Search agent names or descriptions...",value:er,onChange:e=>ei(e.target.value),className:"border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"})]})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-sm font-medium mb-3 text-gray-700",children:"Skills:"}),(0,a.jsx)(m.Select,{mode:"multiple",value:eg,onChange:e=>ex(e),placeholder:"Select skills",className:"w-full",size:"large",allowClear:!0,children:R&&Array.isArray(R)&&(P=new Set,R.forEach(e=>{e.skills?.forEach(e=>{e.tags?.forEach(e=>P.add(e))})}),Array.from(P).sort()).map(e=>(0,a.jsx)(m.Select.Option,{value:e,children:e},e))})]})]}),(0,a.jsx)(b.ModelDataTable,{columns:[{header:"Agent Name",accessorKey:"name",enableSorting:!0,cell:({row:e})=>(0,a.jsx)("div",{className:"overflow-hidden",children:(0,a.jsx)(g.Tooltip,{title:e.original.name,children:(0,a.jsx)(l.Button,{size:"xs",variant:"light",className:"font-mono text-blue-500 bg-blue-50 hover:bg-blue-100 text-xs font-normal px-2 py-0.5 text-left",onClick:()=>{ek(e.original),eN(!0)},children:e.original.name})})}),size:150},{header:"Description",accessorKey:"description",enableSorting:!1,cell:({row:e})=>{let t=e.original.description,s=t.length>80?t.substring(0,80)+"...":t;return(0,a.jsx)(g.Tooltip,{title:t,children:(0,a.jsx)(o.Text,{className:"text-sm text-gray-700",children:s})})},size:250},{header:"Version",accessorKey:"version",enableSorting:!0,cell:({row:e})=>(0,a.jsx)(o.Text,{className:"text-sm",children:e.original.version}),size:80},{header:"Provider",accessorKey:"provider",enableSorting:!1,cell:({row:e})=>{let t=e.original.provider;return t?(0,a.jsx)("div",{className:"text-sm",children:(0,a.jsx)(o.Text,{className:"font-medium",children:t.organization})}):(0,a.jsx)(o.Text,{className:"text-gray-400",children:"-"})},size:120},{header:"Skills",accessorKey:"skills",enableSorting:!1,cell:({row:e})=>{let t=e.original.skills||[];return 0===t.length?(0,a.jsx)(o.Text,{className:"text-gray-400",children:"-"}):1===t.length?(0,a.jsx)("div",{className:"h-6 flex items-center",children:(0,a.jsx)(u.Tag,{color:"purple",className:"text-xs",children:t[0].name})}):(0,a.jsxs)("div",{className:"h-6 flex items-center space-x-1",children:[(0,a.jsx)(u.Tag,{color:"purple",className:"text-xs",children:t[0].name}),(0,a.jsx)(g.Tooltip,{title:(0,a.jsxs)("div",{className:"space-y-1",children:[(0,a.jsx)("div",{className:"font-medium",children:"All Skills:"}),t.map((e,t)=>(0,a.jsxs)("div",{className:"text-xs",children:["• ",e.name]},t))]}),trigger:"click",placement:"topLeft",children:(0,a.jsxs)("span",{className:"text-xs text-purple-600 cursor-pointer hover:text-purple-800 hover:underline",onClick:e=>e.stopPropagation(),children:["+",t.length-1]})})]})},size:150},{header:"Capabilities",accessorKey:"capabilities",enableSorting:!1,cell:({row:e})=>{let t=Object.entries(e.original.capabilities||{}).filter(([e,t])=>!0===t).map(([e])=>e);return 0===t.length?(0,a.jsx)(o.Text,{className:"text-gray-400",children:"-"}):(0,a.jsx)("div",{className:"flex flex-wrap gap-1",children:t.map(e=>(0,a.jsx)(u.Tag,{color:"green",className:"text-xs capitalize",children:e},e))})},size:150}],data:ez,isLoading:Z,defaultSorting:[{id:"name",desc:!1}]}),(0,a.jsx)("div",{className:"mt-8 text-center",children:(0,a.jsxs)(o.Text,{className:"text-sm text-gray-600",children:["Showing ",ez.length," of ",R?.length||0," agents"]})})]},"agents"),(0,a.jsxs)(A,{tab:"MCP Hub",children:[(0,a.jsx)("div",{className:"flex justify-between items-center mb-8",children:(0,a.jsx)(c.Title,{className:"text-2xl font-semibold text-gray-900",children:"Available MCP Servers"})}),(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)("div",{className:"flex items-center space-x-2 mb-3",children:[(0,a.jsx)(o.Text,{className:"text-sm font-medium text-gray-700",children:"Search MCP Servers:"}),(0,a.jsx)(g.Tooltip,{title:"Search MCP servers by name or description",placement:"top",children:(0,a.jsx)(h.Info,{className:"w-4 h-4 text-gray-400 cursor-help"})})]}),(0,a.jsxs)("div",{className:"relative",children:[(0,a.jsx)(i.SearchIcon,{className:"w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"}),(0,a.jsx)("input",{type:"text",placeholder:"Search MCP server names or descriptions...",value:el,onChange:e=>en(e.target.value),className:"border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"})]})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-sm font-medium mb-3 text-gray-700",children:"Transport:"}),(0,a.jsx)(m.Select,{mode:"multiple",value:eh,onChange:e=>ef(e),placeholder:"Select transport types",className:"w-full",size:"large",allowClear:!0,children:H&&Array.isArray(H)&&(E=new Set,H.forEach(e=>{e.transport&&E.add(e.transport)}),Array.from(E).sort()).map(e=>(0,a.jsx)(m.Select.Option,{value:e,children:e},e))})]})]}),(0,a.jsx)(b.ModelDataTable,{columns:[{header:"Server Name",accessorKey:"server_name",enableSorting:!0,cell:({row:e})=>(0,a.jsx)("div",{className:"overflow-hidden",children:(0,a.jsx)(g.Tooltip,{title:e.original.server_name,children:(0,a.jsx)(l.Button,{size:"xs",variant:"light",className:"font-mono text-blue-500 bg-blue-50 hover:bg-blue-100 text-xs font-normal px-2 py-0.5 text-left",onClick:()=>{eM(e.original),eS(!0)},children:e.original.server_name})})}),size:150},{header:"Description",accessorKey:"mcp_info.description",enableSorting:!1,cell:({row:e})=>{let t=e.original.mcp_info?.description||"-",s=t.length>80?t.substring(0,80)+"...":t;return(0,a.jsx)(g.Tooltip,{title:t,children:(0,a.jsx)(o.Text,{className:"text-sm text-gray-700",children:s})})},size:250},{header:"URL",accessorKey:"url",enableSorting:!1,cell:({row:e})=>{let t=e.original.url,s=t.length>40?t.substring(0,40)+"...":t;return(0,a.jsx)(g.Tooltip,{title:t,children:(0,a.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,a.jsx)(o.Text,{className:"text-xs font-mono",children:s}),(0,a.jsx)(x.Copy,{onClick:()=>eD(t),className:"cursor-pointer text-gray-500 hover:text-blue-500 w-3 h-3"})]})})},size:200},{header:"Transport",accessorKey:"transport",enableSorting:!0,cell:({row:e})=>{let t=e.original.transport;return(0,a.jsx)(u.Tag,{color:"blue",className:"text-xs uppercase",children:t})},size:100},{header:"Auth Type",accessorKey:"auth_type",enableSorting:!0,cell:({row:e})=>{let t=e.original.auth_type;return(0,a.jsx)(u.Tag,{color:"none"===t?"gray":"green",className:"text-xs capitalize",children:t})},size:100}],data:eR,isLoading:ee,defaultSorting:[{id:"server_name",desc:!1}]}),(0,a.jsx)("div",{className:"mt-8 text-center",children:(0,a.jsxs)(o.Text,{className:"text-sm text-gray-600",children:["Showing ",eR.length," of ",H?.length||0," MCP servers"]})})]},"mcp"),(0,a.jsx)(A,{tab:"Claude Code Plugin Marketplace",children:(0,a.jsx)(v.default,{publicPage:!0})},"marketplace")]})})]}),(0,a.jsx)(d.Modal,{title:(0,a.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,a.jsx)("span",{children:eA?.model_group||"Model Details"}),eA&&(0,a.jsx)(g.Tooltip,{title:"Copy model name",children:(0,a.jsx)(x.Copy,{onClick:()=>eD(eA.model_group),className:"cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"})})]}),width:1e3,open:ey,footer:null,onOk:()=>{ev(!1),eT(null)},onCancel:()=>{ev(!1),eT(null)},children:eA&&(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Model Overview"}),(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Model Name:"}),(0,a.jsx)(o.Text,{children:eA.model_group})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Mode:"}),(0,a.jsx)(o.Text,{children:eA.mode||"Not specified"})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Providers:"}),(0,a.jsx)("div",{className:"flex flex-wrap gap-1 mt-1",children:eA.providers.map(e=>{let{logo:t}=(0,S.getProviderLogoAndName)(e);return(0,a.jsx)(u.Tag,{color:"blue",children:(0,a.jsxs)("div",{className:"flex items-center space-x-1",children:[t&&(0,a.jsx)("img",{src:t,alt:e,className:"w-3 h-3 flex-shrink-0 object-contain",onError:e=>{e.target.style.display="none"}}),(0,a.jsx)("span",{className:"capitalize",children:e})]})},e)})})]})]}),eA.model_group.includes("*")&&(0,a.jsx)("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4",children:(0,a.jsxs)("div",{className:"flex items-start space-x-2",children:[(0,a.jsx)(h.Info,{className:"w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium text-blue-900 mb-2",children:"Wildcard Routing"}),(0,a.jsxs)(o.Text,{className:"text-sm text-blue-800 mb-2",children:["This model uses wildcard routing. You can pass any value where you see the"," ",(0,a.jsx)("code",{className:"bg-blue-100 px-1 py-0.5 rounded text-xs",children:"*"})," symbol."]}),(0,a.jsxs)(o.Text,{className:"text-sm text-blue-800",children:["For example, with"," ",(0,a.jsx)("code",{className:"bg-blue-100 px-1 py-0.5 rounded text-xs",children:eA.model_group}),", you can use any string (",(0,a.jsx)("code",{className:"bg-blue-100 px-1 py-0.5 rounded text-xs",children:eA.model_group.replace("*","my-custom-value")}),") that matches this pattern."]})]})]})})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Token & Cost Information"}),(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Max Input Tokens:"}),(0,a.jsx)(o.Text,{children:eA.max_input_tokens?.toLocaleString()||"Not specified"})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Max Output Tokens:"}),(0,a.jsx)(o.Text,{children:eA.max_output_tokens?.toLocaleString()||"Not specified"})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Input Cost per 1M Tokens:"}),(0,a.jsx)(o.Text,{children:eA.input_cost_per_token?eF(eA.input_cost_per_token):"Not specified"})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Output Cost per 1M Tokens:"}),(0,a.jsx)(o.Text,{children:eA.output_cost_per_token?eF(eA.output_cost_per_token):"Not specified"})]})]})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Capabilities"}),(0,a.jsx)("div",{className:"flex flex-wrap gap-2",children:(O=Object.entries(eA).filter(([e,t])=>e.startsWith("supports_")&&!0===t).map(([e])=>e),$=["green","blue","purple","orange","red","yellow"],0===O.length?(0,a.jsx)(o.Text,{className:"text-gray-500",children:"No special capabilities listed"}):O.map((e,t)=>(0,a.jsx)(u.Tag,{color:$[t%$.length],children:eH(e)},e)))})]}),(eA.tpm||eA.rpm)&&(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Rate Limits"}),(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[eA.tpm&&(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Tokens per Minute:"}),(0,a.jsx)(o.Text,{children:eA.tpm.toLocaleString()})]}),eA.rpm&&(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Requests per Minute:"}),(0,a.jsx)(o.Text,{children:eA.rpm.toLocaleString()})]})]})]}),eA.supported_openai_params&&(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Supported OpenAI Parameters"}),(0,a.jsx)("div",{className:"flex flex-wrap gap-2",children:eA.supported_openai_params.map(e=>(0,a.jsx)(u.Tag,{color:"green",children:e},e))})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Usage Example"}),(0,a.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,a.jsx)("pre",{className:"text-sm",children:(0,N.generateCodeSnippet)({apiKeySource:"custom",accessToken:null,apiKey:"your_api_key",inputMessage:"Hello, how are you?",chatHistory:[{role:"user",content:"Hello, how are you?",isImage:!1}],selectedTags:[],selectedVectorStores:[],selectedGuardrails:[],selectedPolicies:[],selectedMCPServers:[],endpointType:(0,w.getEndpointType)(eA.mode||"chat"),selectedModel:eA.model_group,selectedSdk:"openai"})})}),(0,a.jsx)("div",{className:"mt-2 text-right",children:(0,a.jsx)("button",{onClick:()=>{eD((0,N.generateCodeSnippet)({apiKeySource:"custom",accessToken:null,apiKey:"your_api_key",inputMessage:"Hello, how are you?",chatHistory:[{role:"user",content:"Hello, how are you?",isImage:!1}],selectedTags:[],selectedVectorStores:[],selectedGuardrails:[],selectedPolicies:[],selectedMCPServers:[],endpointType:(0,w.getEndpointType)(eA.mode||"chat"),selectedModel:eA.model_group,selectedSdk:"openai"}))},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:"Copy to clipboard"})})]})]})}),(0,a.jsx)(d.Modal,{title:(0,a.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,a.jsx)("span",{children:eC?.name||"Agent Details"}),eC&&(0,a.jsx)(g.Tooltip,{title:"Copy agent name",children:(0,a.jsx)(x.Copy,{onClick:()=>eD(eC.name),className:"cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"})})]}),width:1e3,open:ej,footer:null,onOk:()=>{eN(!1),ek(null)},onCancel:()=>{eN(!1),ek(null)},children:eC&&(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Agent Overview"}),(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Name:"}),(0,a.jsx)(o.Text,{children:eC.name})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Version:"}),(0,a.jsx)(o.Text,{children:eC.version})]}),(0,a.jsxs)("div",{className:"col-span-2",children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Description:"}),(0,a.jsx)(o.Text,{children:eC.description})]}),eC.url&&(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"URL:"}),(0,a.jsx)("a",{href:eC.url,target:"_blank",rel:"noopener noreferrer",className:"text-blue-600 hover:text-blue-800 text-sm break-all",children:eC.url})]})]})]}),eC.capabilities&&(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Capabilities"}),(0,a.jsx)("div",{className:"flex flex-wrap gap-2",children:Object.entries(eC.capabilities).filter(([e,t])=>!0===t).map(([e])=>(0,a.jsx)(u.Tag,{color:"green",className:"capitalize",children:e},e))})]}),eC.skills&&eC.skills.length>0&&(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Skills"}),(0,a.jsx)("div",{className:"space-y-4",children:eC.skills.map((e,t)=>(0,a.jsxs)("div",{className:"border border-gray-200 rounded-lg p-4",children:[(0,a.jsx)("div",{className:"flex items-start justify-between mb-2",children:(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium text-base",children:e.name}),(0,a.jsx)(o.Text,{className:"text-sm text-gray-600",children:e.description})]})}),e.tags&&e.tags.length>0&&(0,a.jsx)("div",{className:"flex flex-wrap gap-1 mt-2",children:e.tags.map(e=>(0,a.jsx)(u.Tag,{color:"purple",className:"text-xs",children:e},e))})]},t))})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Input/Output Modes"}),(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Input Modes:"}),(0,a.jsx)("div",{className:"flex flex-wrap gap-1 mt-1",children:eC.defaultInputModes?.map(e=>(0,a.jsx)(u.Tag,{color:"blue",children:e},e))})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Output Modes:"}),(0,a.jsx)("div",{className:"flex flex-wrap gap-1 mt-1",children:eC.defaultOutputModes?.map(e=>(0,a.jsx)(u.Tag,{color:"blue",children:e},e))})]})]})]}),eC.documentationUrl&&(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Documentation"}),(0,a.jsxs)("a",{href:eC.documentationUrl,target:"_blank",rel:"noopener noreferrer",className:"text-blue-600 hover:text-blue-800 flex items-center space-x-2",children:[(0,a.jsx)(r.ExternalLinkIcon,{className:"w-4 h-4"}),(0,a.jsx)("span",{children:"View Documentation"})]})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Usage Example (A2A Protocol)"}),(0,a.jsxs)("div",{className:"mb-4",children:[(0,a.jsx)(o.Text,{className:"text-sm font-medium mb-2 text-gray-700",children:"Step 1: Retrieve Agent Card"}),(0,a.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,a.jsx)("pre",{className:"text-xs",children:`base_url = '${eC.url}'

resolver = A2ACardResolver(
    httpx_client=httpx_client,
    base_url=base_url,
    # agent_card_path uses default, extended_agent_card_path also uses default
)

# Fetch Public Agent Card and Initialize Client
final_agent_card_to_use: AgentCard | None = None
_public_card = (
    await resolver.get_agent_card()
)  # Fetches from default public path - \`/agents/{agent_id}/\`
final_agent_card_to_use = _public_card

if _public_card.supports_authenticated_extended_card:
    try:
        auth_headers_dict = {
            'Authorization': 'Bearer dummy-token-for-extended-card'
        }
        _extended_card = await resolver.get_agent_card(
            relative_card_path=EXTENDED_AGENT_CARD_PATH,
            http_kwargs={'headers': auth_headers_dict},
        )
        final_agent_card_to_use = (
            _extended_card  # Update to use the extended card
        )
    except Exception as e_extended:
        logger.warning(
            f'Failed to fetch extended agent card: {e_extended}. Will proceed with public card.',
            exc_info=True,
        )`})}),(0,a.jsx)("div",{className:"mt-2 text-right",children:(0,a.jsx)("button",{onClick:()=>{eD(`from a2a.client import A2ACardResolver, A2AClient
from a2a.types import (
    AgentCard,
    MessageSendParams,
    SendMessageRequest,
    SendStreamingMessageRequest,
)
from a2a.utils.constants import (
    AGENT_CARD_WELL_KNOWN_PATH,
    EXTENDED_AGENT_CARD_PATH,
)

base_url = '${eC.url}'

resolver = A2ACardResolver(
    httpx_client=httpx_client,
    base_url=base_url,
    # agent_card_path uses default, extended_agent_card_path also uses default
)

# Fetch Public Agent Card and Initialize Client
final_agent_card_to_use: AgentCard | None = None
_public_card = (
    await resolver.get_agent_card()
)  # Fetches from default public path - \`/agents/{agent_id}/\`
final_agent_card_to_use = _public_card

if _public_card.supports_authenticated_extended_card:
    try:
        auth_headers_dict = {
            'Authorization': 'Bearer dummy-token-for-extended-card'
        }
        _extended_card = await resolver.get_agent_card(
            relative_card_path=EXTENDED_AGENT_CARD_PATH,
            http_kwargs={'headers': auth_headers_dict},
        )
        final_agent_card_to_use = (
            _extended_card  # Update to use the extended card
        )
    except Exception as e_extended:
        logger.warning(
            f'Failed to fetch extended agent card: {e_extended}. Will proceed with public card.',
            exc_info=True,
        )`)},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:"Copy to clipboard"})})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-sm font-medium mb-2 text-gray-700",children:"Step 2: Call the Agent"}),(0,a.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,a.jsx)("pre",{className:"text-xs",children:`client = A2AClient(
    httpx_client=httpx_client, agent_card=final_agent_card_to_use
)

send_message_payload: dict[str, Any] = {
    'message': {
        'role': 'user',
        'parts': [
            {'kind': 'text', 'text': 'how much is 10 USD in INR?'}
        ],
        'messageId': uuid4().hex,
    },
}
request = SendMessageRequest(
    id=str(uuid4()), params=MessageSendParams(**send_message_payload)
)

response = await client.send_message(request)
print(response.model_dump(mode='json', exclude_none=True))`})}),(0,a.jsx)("div",{className:"mt-2 text-right",children:(0,a.jsx)("button",{onClick:()=>{eD(`client = A2AClient(
    httpx_client=httpx_client, agent_card=final_agent_card_to_use
)

send_message_payload: dict[str, Any] = {
    'message': {
        'role': 'user',
        'parts': [
            {'kind': 'text', 'text': 'how much is 10 USD in INR?'}
        ],
        'messageId': uuid4().hex,
    },
}
request = SendMessageRequest(
    id=str(uuid4()), params=MessageSendParams(**send_message_payload)
)

response = await client.send_message(request)
print(response.model_dump(mode='json', exclude_none=True))`)},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:"Copy to clipboard"})})]})]})]})}),(0,a.jsx)(d.Modal,{title:(0,a.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,a.jsx)("span",{children:eI?.server_name||"MCP Server Details"}),eI&&(0,a.jsx)(g.Tooltip,{title:"Copy server name",children:(0,a.jsx)(x.Copy,{onClick:()=>eD(eI.server_name),className:"cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"})})]}),width:1e3,open:ew,footer:null,onOk:()=>{eS(!1),eM(null)},onCancel:()=>{eS(!1),eM(null)},children:eI&&(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Server Overview"}),(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Server Name:"}),(0,a.jsx)(o.Text,{children:eI.server_name})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Transport:"}),(0,a.jsx)(u.Tag,{color:"blue",children:eI.transport})]}),eI.alias&&(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Alias:"}),(0,a.jsx)(o.Text,{children:eI.alias})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Auth Type:"}),(0,a.jsx)(u.Tag,{color:"none"===eI.auth_type?"gray":"green",children:eI.auth_type})]}),(0,a.jsxs)("div",{className:"col-span-2",children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"Description:"}),(0,a.jsx)(o.Text,{children:eI.mcp_info?.description||"-"})]}),(0,a.jsxs)("div",{className:"col-span-2",children:[(0,a.jsx)(o.Text,{className:"font-medium",children:"URL:"}),(0,a.jsxs)("a",{href:eI.url,target:"_blank",rel:"noopener noreferrer",className:"text-blue-600 hover:text-blue-800 text-sm break-all flex items-center space-x-2",children:[(0,a.jsx)("span",{children:eI.url}),(0,a.jsx)(r.ExternalLinkIcon,{className:"w-4 h-4"})]})]})]})]}),eI.mcp_info&&Object.keys(eI.mcp_info).length>0&&(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Additional Information"}),(0,a.jsx)("div",{className:"bg-gray-50 p-4 rounded-lg",children:(0,a.jsx)("pre",{className:"text-xs overflow-x-auto",children:JSON.stringify(eI.mcp_info,null,2)})})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(o.Text,{className:"text-lg font-semibold mb-4",children:"Usage Example"}),(0,a.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,a.jsx)("pre",{className:"text-sm",children:`# Using MCP Server with Python FastMCP

from fastmcp import Client
import asyncio

# Standard MCP configuration
config = {
    "mcpServers": {
        "${eI.server_name}": {
            "url": "http://localhost:4000/${eI.server_name}/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-1234"
            }
        }
    }
}

# Create a client that connects to the server
client = Client(config)

async def main():
    async with client:
        # List available tools
        tools = await client.list_tools()
        print(f"Available tools: {[tool.name for tool in tools]}")

        # Call a tool
        response = await client.call_tool(
            name="tool_name", 
            arguments={"arg": "value"}
        )
        print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(main())`})}),(0,a.jsx)("div",{className:"mt-2 text-right",children:(0,a.jsx)("button",{onClick:()=>{eD(`# Using MCP Server with Python FastMCP

from fastmcp import Client
import asyncio

# Standard MCP configuration
config = {
    "mcpServers": {
        "${eI.server_name}": {
            "url": "http://localhost:4000/${eI.server_name}/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-1234"
            }
        }
    }
}

# Create a client that connects to the server
client = Client(config)

async def main():
    async with client:
        # List available tools
        tools = await client.list_tools()
        print(f"Available tools: {[tool.name for tool in tools]}")

        # Call a tool
        response = await client.call_tool(
            name="tool_name", 
            arguments={"arg": "value"}
        )
        print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(main())`)},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:"Copy to clipboard"})})]})]})})]})})}])}]);