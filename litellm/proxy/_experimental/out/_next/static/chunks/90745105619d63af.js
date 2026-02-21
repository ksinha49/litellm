(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,190272,785913,e=>{"use strict";var t,i,r=((t={}).AUDIO_SPEECH="audio_speech",t.AUDIO_TRANSCRIPTION="audio_transcription",t.IMAGE_GENERATION="image_generation",t.VIDEO_GENERATION="video_generation",t.CHAT="chat",t.RESPONSES="responses",t.IMAGE_EDITS="image_edits",t.ANTHROPIC_MESSAGES="anthropic_messages",t.EMBEDDING="embedding",t),n=((i={}).IMAGE="image",i.VIDEO="video",i.CHAT="chat",i.RESPONSES="responses",i.IMAGE_EDITS="image_edits",i.ANTHROPIC_MESSAGES="anthropic_messages",i.EMBEDDINGS="embeddings",i.SPEECH="speech",i.TRANSCRIPTION="transcription",i.A2A_AGENTS="a2a_agents",i.MCP="mcp",i);let o={image_generation:"image",video_generation:"video",chat:"chat",responses:"responses",image_edits:"image_edits",anthropic_messages:"anthropic_messages",audio_speech:"speech",audio_transcription:"transcription",embedding:"embeddings"};e.s(["EndpointType",()=>n,"getEndpointType",0,e=>{if(console.log("getEndpointType:",e),Object.values(r).includes(e)){let t=o[e];return console.log("endpointType:",t),t}return"chat"}],785913),e.s(["generateCodeSnippet",0,e=>{let t,{apiKeySource:i,accessToken:r,apiKey:o,inputMessage:a,chatHistory:l,selectedTags:s,selectedVectorStores:c,selectedGuardrails:d,selectedPolicies:m,selectedMCPServers:p,mcpServers:u,mcpServerToolRestrictions:g,selectedVoice:f,endpointType:h,selectedModel:b,selectedSdk:$,proxySettings:v}=e,_="session"===i?r:o,w=window.location.origin,x=v?.LITELLM_UI_API_DOC_BASE_URL;x&&x.trim()?w=x:v?.PROXY_BASE_URL&&(w=v.PROXY_BASE_URL);let I=a||"Your prompt here",y=I.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n"),C=l.filter(e=>!e.isImage).map(({role:e,content:t})=>({role:e,content:t})),S={};s.length>0&&(S.tags=s),c.length>0&&(S.vector_stores=c),d.length>0&&(S.guardrails=d),m.length>0&&(S.policies=m);let k=b||"your-model-name",A="azure"===$?`import openai

client = openai.AzureOpenAI(
	api_key="${_||"YOUR_LITELLM_API_KEY"}",
	azure_endpoint="${w}",
	api_version="2024-02-01"
)`:`import openai

client = openai.OpenAI(
	api_key="${_||"YOUR_LITELLM_API_KEY"}",
	base_url="${w}"
)`;switch(h){case n.CHAT:{let e=Object.keys(S).length>0,i="";if(e){let e=JSON.stringify({metadata:S},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();i=`,
    extra_body=${e}`}let r=C.length>0?C:[{role:"user",content:I}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.chat.completions.create(
    model="${k}",
    messages=${JSON.stringify(r,null,4)}${i}
)

print(response)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.chat.completions.create(
#     model="${k}",
#     messages=[
#         {
#             "role": "user",
#             "content": [
#                 {
#                     "type": "text",
#                     "text": "${y}"
#                 },
#                 {
#                     "type": "image_url",
#                     "image_url": {
#                         "url": f"data:image/jpeg;base64,{base64_file}"  # or data:application/pdf;base64,{base64_file}
#                     }
#                 }
#             ]
#         }
#     ]${i}
# )
# print(response_with_file)
`;break}case n.RESPONSES:{let e=Object.keys(S).length>0,i="";if(e){let e=JSON.stringify({metadata:S},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();i=`,
    extra_body=${e}`}let r=C.length>0?C:[{role:"user",content:I}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.responses.create(
    model="${k}",
    input=${JSON.stringify(r,null,4)}${i}
)

print(response.output_text)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.responses.create(
#     model="${k}",
#     input=[
#         {
#             "role": "user",
#             "content": [
#                 {"type": "input_text", "text": "${y}"},
#                 {
#                     "type": "input_image",
#                     "image_url": f"data:image/jpeg;base64,{base64_file}",  # or data:application/pdf;base64,{base64_file}
#                 },
#             ],
#         }
#     ]${i}
# )
# print(response_with_file.output_text)
`;break}case n.IMAGE:t="azure"===$?`
# NOTE: The Azure SDK does not have a direct equivalent to the multi-modal 'responses.create' method shown for OpenAI.
# This snippet uses 'client.images.generate' and will create a new image based on your prompt.
# It does not use the uploaded image, as 'client.images.generate' does not support image inputs in this context.
import os
import requests
import json
import time
from PIL import Image

result = client.images.generate(
	model="${k}",
	prompt="${a}",
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
prompt = "${y}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${k}",
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
`;break;case n.IMAGE_EDITS:t="azure"===$?`
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
prompt = "${y}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${k}",
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
prompt = "${y}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${k}",
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
`;break;case n.EMBEDDINGS:t=`
response = client.embeddings.create(
	input="${a||"Your string here"}",
	model="${k}",
	encoding_format="base64" # or "float"
)

print(response.data[0].embedding)
`;break;case n.TRANSCRIPTION:t=`
# Open the audio file
audio_file = open("path/to/your/audio/file.mp3", "rb")

# Make the transcription request
response = client.audio.transcriptions.create(
	model="${k}",
	file=audio_file${a?`,
	prompt="${a.replace(/"/g,'\\"')}"`:""}
)

print(response.text)
`;break;case n.SPEECH:t=`
# Make the text-to-speech request
response = client.audio.speech.create(
	model="${k}",
	input="${a||"Your text to convert to speech here"}",
	voice="${f}"  # Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
)

# Save the audio to a file
output_filename = "output_speech.mp3"
response.stream_to_file(output_filename)
print(f"Audio saved to {output_filename}")

# Optional: Customize response format and speed
# response = client.audio.speech.create(
#     model="${k}",
#     input="${a||"Your text to convert to speech here"}",
#     voice="alloy",
#     response_format="mp3",  # Options: mp3, opus, aac, flac, wav, pcm
#     speed=1.0  # Range: 0.25 to 4.0
# )
# response.stream_to_file("output_speech.mp3")
`;break;default:t="\n# Code generation for this endpoint is not implemented yet."}return`${A}
${t}`}],190272)},916925,e=>{"use strict";var t,i=((t={}).A2A_Agent="A2A Agent",t.AIML="AI/ML API",t.Bedrock="Amazon Bedrock",t.Anthropic="Anthropic",t.AssemblyAI="AssemblyAI",t.SageMaker="AWS SageMaker",t.Azure="Azure",t.Azure_AI_Studio="Azure AI Foundry (Studio)",t.Cerebras="Cerebras",t.Cohere="Cohere",t.Dashscope="Dashscope",t.Databricks="Databricks (Qwen API)",t.DeepInfra="DeepInfra",t.Deepgram="Deepgram",t.Deepseek="Deepseek",t.ElevenLabs="ElevenLabs",t.FalAI="Fal AI",t.FireworksAI="Fireworks AI",t.Google_AI_Studio="Google AI Studio",t.GradientAI="GradientAI",t.Groq="Groq",t.Hosted_Vllm="vllm",t.Infinity="Infinity",t.JinaAI="Jina AI",t.MiniMax="MiniMax",t.MistralAI="Mistral AI",t.Ollama="Ollama",t.OpenAI="OpenAI",t.OpenAI_Compatible="OpenAI-Compatible Endpoints (Together AI, etc.)",t.OpenAI_Text="OpenAI Text Completion",t.OpenAI_Text_Compatible="OpenAI-Compatible Text Completion Models (Together AI, etc.)",t.Openrouter="Openrouter",t.Oracle="Oracle Cloud Infrastructure (OCI)",t.Perplexity="Perplexity",t.RunwayML="RunwayML",t.Sambanova="Sambanova",t.Snowflake="Snowflake",t.TogetherAI="TogetherAI",t.Triton="Triton",t.Vertex_AI="Vertex AI (Anthropic, Gemini, etc.)",t.VolcEngine="VolcEngine",t.Voyage="Voyage AI",t.xAI="xAI",t.SAP="SAP Generative AI Hub",t.Watsonx="Watsonx",t);let r={A2A_Agent:"a2a_agent",AIML:"aiml",OpenAI:"openai",OpenAI_Text:"text-completion-openai",Azure:"azure",Azure_AI_Studio:"azure_ai",Anthropic:"anthropic",Google_AI_Studio:"gemini",Bedrock:"bedrock",Groq:"groq",MiniMax:"minimax",MistralAI:"mistral",Cohere:"cohere",OpenAI_Compatible:"openai",OpenAI_Text_Compatible:"text-completion-openai",Vertex_AI:"vertex_ai",Databricks:"databricks",Dashscope:"dashscope",xAI:"xai",Deepseek:"deepseek",Ollama:"ollama",AssemblyAI:"assemblyai",Cerebras:"cerebras",Sambanova:"sambanova",Perplexity:"perplexity",RunwayML:"runwayml",TogetherAI:"together_ai",Openrouter:"openrouter",Oracle:"oci",Snowflake:"snowflake",FireworksAI:"fireworks_ai",GradientAI:"gradient_ai",Triton:"triton",Deepgram:"deepgram",ElevenLabs:"elevenlabs",FalAI:"fal_ai",SageMaker:"sagemaker_chat",Voyage:"voyage",JinaAI:"jina_ai",VolcEngine:"volcengine",DeepInfra:"deepinfra",Hosted_Vllm:"hosted_vllm",Infinity:"infinity",SAP:"sap",Watsonx:"watsonx"},n="../ui/assets/logos/",o={"A2A Agent":`${n}a2a_agent.png`,"AI/ML API":`${n}aiml_api.svg`,Anthropic:`${n}anthropic.svg`,AssemblyAI:`${n}assemblyai_small.png`,Azure:`${n}microsoft_azure.svg`,"Azure AI Foundry (Studio)":`${n}microsoft_azure.svg`,"Amazon Bedrock":`${n}bedrock.svg`,"AWS SageMaker":`${n}bedrock.svg`,Cerebras:`${n}cerebras.svg`,Cohere:`${n}cohere.svg`,"Databricks (Qwen API)":`${n}databricks.svg`,Dashscope:`${n}dashscope.svg`,Deepseek:`${n}deepseek.svg`,"Fireworks AI":`${n}fireworks.svg`,Groq:`${n}groq.svg`,"Google AI Studio":`${n}google.svg`,vllm:`${n}vllm.png`,Infinity:`${n}infinity.png`,MiniMax:`${n}minimax.svg`,"Mistral AI":`${n}mistral.svg`,Ollama:`${n}ollama.svg`,OpenAI:`${n}openai_small.svg`,"OpenAI Text Completion":`${n}openai_small.svg`,"OpenAI-Compatible Text Completion Models (Together AI, etc.)":`${n}openai_small.svg`,"OpenAI-Compatible Endpoints (Together AI, etc.)":`${n}openai_small.svg`,Openrouter:`${n}openrouter.svg`,"Oracle Cloud Infrastructure (OCI)":`${n}oracle.svg`,Perplexity:`${n}perplexity-ai.svg`,RunwayML:`${n}runwayml.png`,Sambanova:`${n}sambanova.svg`,Snowflake:`${n}snowflake.svg`,TogetherAI:`${n}togetherai.svg`,"Vertex AI (Anthropic, Gemini, etc.)":`${n}google.svg`,xAI:`${n}xai.svg`,GradientAI:`${n}gradientai.svg`,Triton:`${n}nvidia_triton.png`,Deepgram:`${n}deepgram.png`,ElevenLabs:`${n}elevenlabs.png`,"Fal AI":`${n}fal_ai.jpg`,"Voyage AI":`${n}voyage.webp`,"Jina AI":`${n}jina.png`,VolcEngine:`${n}volcengine.png`,DeepInfra:`${n}deepinfra.png`,"SAP Generative AI Hub":`${n}sap.png`};e.s(["Providers",()=>i,"getPlaceholder",0,e=>{if("AI/ML API"===e)return"aiml/flux-pro/v1.1";if("Vertex AI (Anthropic, Gemini, etc.)"===e)return"gemini-pro";if("Anthropic"==e)return"claude-3-opus";if("Amazon Bedrock"==e)return"claude-3-opus";if("AWS SageMaker"==e)return"sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b";else if("Google AI Studio"==e)return"gemini-pro";else if("Azure AI Foundry (Studio)"==e)return"azure_ai/command-r-plus";else if("Azure"==e)return"my-deployment";else if("Oracle Cloud Infrastructure (OCI)"==e)return"oci/xai.grok-4";else if("Snowflake"==e)return"snowflake/mistral-7b";else if("Voyage AI"==e)return"voyage/";else if("Jina AI"==e)return"jina_ai/";else if("VolcEngine"==e)return"volcengine/<any-model-on-volcengine>";else if("DeepInfra"==e)return"deepinfra/<any-model-on-deepinfra>";else if("Fal AI"==e)return"fal_ai/fal-ai/flux-pro/v1.1-ultra";else if("RunwayML"==e)return"runwayml/gen4_turbo";else if("Watsonx"===e)return"watsonx/ibm/granite-3-3-8b-instruct";else return"gpt-3.5-turbo"},"getProviderLogoAndName",0,e=>{if(!e)return{logo:"",displayName:"-"};if("gemini"===e.toLowerCase()){let e="Google AI Studio";return{logo:o[e],displayName:e}}let t=Object.keys(r).find(t=>r[t].toLowerCase()===e.toLowerCase());if(!t)return{logo:"",displayName:e};let n=i[t];return{logo:o[n],displayName:n}},"getProviderModels",0,(e,t)=>{console.log(`Provider key: ${e}`);let i=r[e];console.log(`Provider mapped to: ${i}`);let n=[];return e&&"object"==typeof t&&(Object.entries(t).forEach(([e,t])=>{if(null!==t&&"object"==typeof t&&"litellm_provider"in t){let r=t.litellm_provider;(r===i||"string"==typeof r&&r.includes(i))&&n.push(e)}}),"Cohere"==e&&(console.log("Adding cohere chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"cohere_chat"===t.litellm_provider&&n.push(e)})),"AWS SageMaker"==e&&(console.log("Adding sagemaker chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"sagemaker_chat"===t.litellm_provider&&n.push(e)}))),n},"providerLogoMap",0,o,"provider_map",0,r])},94629,e=>{"use strict";var t=e.i(271645);let i=t.forwardRef(function(e,i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:i},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"}))});e.s(["SwitchVerticalIcon",0,i],94629)},166406,e=>{"use strict";var t=e.i(190144);e.s(["CopyOutlined",()=>t.default])},798496,e=>{"use strict";var t=e.i(843476),i=e.i(152990),r=e.i(682830),n=e.i(271645),o=e.i(269200),a=e.i(427612),l=e.i(64848),s=e.i(942232),c=e.i(496020),d=e.i(977572),m=e.i(94629),p=e.i(360820),u=e.i(871943);function g({data:e=[],columns:g,isLoading:f=!1,defaultSorting:h=[],pagination:b,onPaginationChange:$,enablePagination:v=!1}){let[_,w]=n.default.useState(h),[x]=n.default.useState("onChange"),[I,y]=n.default.useState({}),[C,S]=n.default.useState({}),k=(0,i.useReactTable)({data:e,columns:g,state:{sorting:_,columnSizing:I,columnVisibility:C,...v&&b?{pagination:b}:{}},columnResizeMode:x,onSortingChange:w,onColumnSizingChange:y,onColumnVisibilityChange:S,...v&&$?{onPaginationChange:$}:{},getCoreRowModel:(0,r.getCoreRowModel)(),getSortedRowModel:(0,r.getSortedRowModel)(),...v?{getPaginationRowModel:(0,r.getPaginationRowModel)()}:{},enableSorting:!0,enableColumnResizing:!0,defaultColumn:{minSize:40,maxSize:500}});return(0,t.jsx)("div",{className:"rounded-lg custom-border relative",children:(0,t.jsx)("div",{className:"overflow-x-auto",children:(0,t.jsx)("div",{className:"relative min-w-full",children:(0,t.jsxs)(o.Table,{className:"[&_td]:py-2 [&_th]:py-2",style:{width:k.getTotalSize(),minWidth:"100%",tableLayout:"fixed"},children:[(0,t.jsx)(a.TableHead,{children:k.getHeaderGroups().map(e=>(0,t.jsx)(c.TableRow,{children:e.headers.map(e=>(0,t.jsxs)(l.TableHeaderCell,{className:`py-1 h-8 relative ${"actions"===e.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.id?120:e.getSize(),position:"actions"===e.id?"sticky":"relative",right:"actions"===e.id?0:"auto"},onClick:e.column.getCanSort()?e.column.getToggleSortingHandler():void 0,children:[(0,t.jsxs)("div",{className:"flex items-center justify-between gap-2",children:[(0,t.jsx)("div",{className:"flex items-center",children:e.isPlaceholder?null:(0,i.flexRender)(e.column.columnDef.header,e.getContext())}),"actions"!==e.id&&e.column.getCanSort()&&(0,t.jsx)("div",{className:"w-4",children:e.column.getIsSorted()?({asc:(0,t.jsx)(p.ChevronUpIcon,{className:"h-4 w-4 text-blue-500"}),desc:(0,t.jsx)(u.ChevronDownIcon,{className:"h-4 w-4 text-blue-500"})})[e.column.getIsSorted()]:(0,t.jsx)(m.SwitchVerticalIcon,{className:"h-4 w-4 text-gray-400"})})]}),e.column.getCanResize()&&(0,t.jsx)("div",{onMouseDown:e.getResizeHandler(),onTouchStart:e.getResizeHandler(),className:`absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none ${e.column.getIsResizing()?"bg-blue-500":"hover:bg-blue-200"}`})]},e.id))},e.id))}),(0,t.jsx)(s.TableBody,{children:f?(0,t.jsx)(c.TableRow,{children:(0,t.jsx)(d.TableCell,{colSpan:g.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"🚅 Loading models..."})})})}):k.getRowModel().rows.length>0?k.getRowModel().rows.map(e=>(0,t.jsx)(c.TableRow,{children:e.getVisibleCells().map(e=>(0,t.jsx)(d.TableCell,{className:`py-0.5 overflow-hidden ${"actions"===e.column.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.column.id?120:e.column.getSize(),position:"actions"===e.column.id?"sticky":"relative",right:"actions"===e.column.id?0:"auto"},children:(0,i.flexRender)(e.column.columnDef.cell,e.getContext())},e.id))},e.id)):(0,t.jsx)(c.TableRow,{children:(0,t.jsx)(d.TableCell,{colSpan:g.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"No models found"})})})})})]})})})})}e.s(["ModelDataTable",()=>g])},653496,e=>{"use strict";var t=e.i(721369);e.s(["Tabs",()=>t.default])},360820,e=>{"use strict";var t=e.i(271645);let i=t.forwardRef(function(e,i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:i},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M5 15l7-7 7 7"}))});e.s(["ChevronUpIcon",0,i],360820)},871943,e=>{"use strict";var t=e.i(271645);let i=t.forwardRef(function(e,i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:i},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M19 9l-7 7-7-7"}))});e.s(["ChevronDownIcon",0,i],871943)},991124,e=>{"use strict";let t=(0,e.i(475254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["default",()=>t])},250980,e=>{"use strict";var t=e.i(271645);let i=t.forwardRef(function(e,i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:i},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"}))});e.s(["PlusCircleIcon",0,i],250980)},502547,e=>{"use strict";var t=e.i(271645);let i=t.forwardRef(function(e,i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:i},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 5l7 7-7 7"}))});e.s(["ChevronRightIcon",0,i],502547)},434626,e=>{"use strict";var t=e.i(271645);let i=t.forwardRef(function(e,i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:i},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"}))});e.s(["ExternalLinkIcon",0,i],434626)},902555,e=>{"use strict";var t=e.i(843476),i=e.i(591935),r=e.i(122577),n=e.i(278587),o=e.i(68155),a=e.i(360820),l=e.i(871943),s=e.i(434626),c=e.i(592968),d=e.i(115504),m=e.i(752978);function p({icon:e,onClick:i,className:r,disabled:n,dataTestId:o}){return n?(0,t.jsx)(m.Icon,{icon:e,size:"sm",className:"opacity-50 cursor-not-allowed","data-testid":o}):(0,t.jsx)(m.Icon,{icon:e,size:"sm",onClick:i,className:(0,d.cx)("cursor-pointer",r),"data-testid":o})}let u={Edit:{icon:i.PencilAltIcon,className:"hover:text-blue-600"},Delete:{icon:o.TrashIcon,className:"hover:text-red-600"},Test:{icon:r.PlayIcon,className:"hover:text-blue-600"},Regenerate:{icon:n.RefreshIcon,className:"hover:text-green-600"},Up:{icon:a.ChevronUpIcon,className:"hover:text-blue-600"},Down:{icon:l.ChevronDownIcon,className:"hover:text-blue-600"},Open:{icon:s.ExternalLinkIcon,className:"hover:text-green-600"}};function g({onClick:e,tooltipText:i,disabled:r=!1,disabledTooltipText:n,dataTestId:o,variant:a}){let{icon:l,className:s}=u[a];return(0,t.jsx)(c.Tooltip,{title:r?n:i,children:(0,t.jsx)("span",{children:(0,t.jsx)(p,{icon:l,onClick:e,className:s,disabled:r,dataTestId:o})})})}e.s(["default",()=>g],902555)},122577,e=>{"use strict";var t=e.i(271645);let i=t.forwardRef(function(e,i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:i},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"}),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}))});e.s(["PlayIcon",0,i],122577)},278587,e=>{"use strict";var t=e.i(271645);let i=t.forwardRef(function(e,i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:i},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"}))});e.s(["RefreshIcon",0,i],278587)},207670,e=>{"use strict";function t(){for(var e,t,i=0,r="",n=arguments.length;i<n;i++)(e=arguments[i])&&(t=function e(t){var i,r,n="";if("string"==typeof t||"number"==typeof t)n+=t;else if("object"==typeof t)if(Array.isArray(t)){var o=t.length;for(i=0;i<o;i++)t[i]&&(r=e(t[i]))&&(n&&(n+=" "),n+=r)}else for(r in t)t[r]&&(n&&(n+=" "),n+=r);return n}(e))&&(r&&(r+=" "),r+=t);return r}e.s(["clsx",()=>t,"default",0,t])},752978,e=>{"use strict";var t=e.i(728889);e.s(["Icon",()=>t.default])},959013,e=>{"use strict";e.i(247167);var t=e.i(931067),i=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"}},{tag:"path",attrs:{d:"M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8z"}}]},name:"plus",theme:"outlined"};var n=e.i(9583),o=i.forwardRef(function(e,o){return i.createElement(n.default,(0,t.default)({},e,{ref:o,icon:r}))});e.s(["default",0,o],959013)},269200,e=>{"use strict";var t=e.i(290571),i=e.i(271645),r=e.i(444755);let n=(0,e.i(673706).makeClassName)("Table"),o=i.default.forwardRef((e,o)=>{let{children:a,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return i.default.createElement("div",{className:(0,r.tremorTwMerge)(n("root"),"overflow-auto",l)},i.default.createElement("table",Object.assign({ref:o,className:(0,r.tremorTwMerge)(n("table"),"w-full text-tremor-default","text-tremor-content","dark:text-dark-tremor-content")},s),a))});o.displayName="Table",e.s(["Table",()=>o],269200)},942232,e=>{"use strict";var t=e.i(290571),i=e.i(271645),r=e.i(444755);let n=(0,e.i(673706).makeClassName)("TableBody"),o=i.default.forwardRef((e,o)=>{let{children:a,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return i.default.createElement(i.default.Fragment,null,i.default.createElement("tbody",Object.assign({ref:o,className:(0,r.tremorTwMerge)(n("root"),"align-top divide-y","divide-tremor-border","dark:divide-dark-tremor-border",l)},s),a))});o.displayName="TableBody",e.s(["TableBody",()=>o],942232)},977572,e=>{"use strict";var t=e.i(290571),i=e.i(271645),r=e.i(444755);let n=(0,e.i(673706).makeClassName)("TableCell"),o=i.default.forwardRef((e,o)=>{let{children:a,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return i.default.createElement(i.default.Fragment,null,i.default.createElement("td",Object.assign({ref:o,className:(0,r.tremorTwMerge)(n("root"),"align-middle whitespace-nowrap text-left p-4",l)},s),a))});o.displayName="TableCell",e.s(["TableCell",()=>o],977572)},427612,e=>{"use strict";var t=e.i(290571),i=e.i(271645),r=e.i(444755);let n=(0,e.i(673706).makeClassName)("TableHead"),o=i.default.forwardRef((e,o)=>{let{children:a,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return i.default.createElement(i.default.Fragment,null,i.default.createElement("thead",Object.assign({ref:o,className:(0,r.tremorTwMerge)(n("root"),"text-left","text-tremor-content","dark:text-dark-tremor-content",l)},s),a))});o.displayName="TableHead",e.s(["TableHead",()=>o],427612)},64848,e=>{"use strict";var t=e.i(290571),i=e.i(271645),r=e.i(444755);let n=(0,e.i(673706).makeClassName)("TableHeaderCell"),o=i.default.forwardRef((e,o)=>{let{children:a,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return i.default.createElement(i.default.Fragment,null,i.default.createElement("th",Object.assign({ref:o,className:(0,r.tremorTwMerge)(n("root"),"whitespace-nowrap text-left font-semibold top-0 px-4 py-3.5","text-tremor-content-strong","dark:text-dark-tremor-content-strong",l)},s),a))});o.displayName="TableHeaderCell",e.s(["TableHeaderCell",()=>o],64848)},496020,e=>{"use strict";var t=e.i(290571),i=e.i(271645),r=e.i(444755);let n=(0,e.i(673706).makeClassName)("TableRow"),o=i.default.forwardRef((e,o)=>{let{children:a,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return i.default.createElement(i.default.Fragment,null,i.default.createElement("tr",Object.assign({ref:o,className:(0,r.tremorTwMerge)(n("row"),l)},s),a))});o.displayName="TableRow",e.s(["TableRow",()=>o],496020)},68155,e=>{"use strict";var t=e.i(271645);let i=t.forwardRef(function(e,i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:i},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"}))});e.s(["TrashIcon",0,i],68155)},728889,e=>{"use strict";var t=e.i(290571),i=e.i(271645),r=e.i(829087),n=e.i(480731),o=e.i(444755),a=e.i(673706),l=e.i(95779);let s={xs:{paddingX:"px-1.5",paddingY:"py-1.5"},sm:{paddingX:"px-1.5",paddingY:"py-1.5"},md:{paddingX:"px-2",paddingY:"py-2"},lg:{paddingX:"px-2",paddingY:"py-2"},xl:{paddingX:"px-2.5",paddingY:"py-2.5"}},c={xs:{height:"h-3",width:"w-3"},sm:{height:"h-5",width:"w-5"},md:{height:"h-5",width:"w-5"},lg:{height:"h-7",width:"w-7"},xl:{height:"h-9",width:"w-9"}},d={simple:{rounded:"",border:"",ring:"",shadow:""},light:{rounded:"rounded-tremor-default",border:"",ring:"",shadow:""},shadow:{rounded:"rounded-tremor-default",border:"border",ring:"",shadow:"shadow-tremor-card dark:shadow-dark-tremor-card"},solid:{rounded:"rounded-tremor-default",border:"border-2",ring:"ring-1",shadow:""},outlined:{rounded:"rounded-tremor-default",border:"border",ring:"ring-2",shadow:""}},m=(0,a.makeClassName)("Icon"),p=i.default.forwardRef((e,p)=>{let{icon:u,variant:g="simple",tooltip:f,size:h=n.Sizes.SM,color:b,className:$}=e,v=(0,t.__rest)(e,["icon","variant","tooltip","size","color","className"]),_=((e,t)=>{switch(e){case"simple":return{textColor:t?(0,a.getColorClassNames)(t,l.colorPalette.text).textColor:"text-tremor-brand dark:text-dark-tremor-brand",bgColor:"",borderColor:"",ringColor:""};case"light":return{textColor:t?(0,a.getColorClassNames)(t,l.colorPalette.text).textColor:"text-tremor-brand dark:text-dark-tremor-brand",bgColor:t?(0,o.tremorTwMerge)((0,a.getColorClassNames)(t,l.colorPalette.background).bgColor,"bg-opacity-20"):"bg-tremor-brand-muted dark:bg-dark-tremor-brand-muted",borderColor:"",ringColor:""};case"shadow":return{textColor:t?(0,a.getColorClassNames)(t,l.colorPalette.text).textColor:"text-tremor-brand dark:text-dark-tremor-brand",bgColor:t?(0,o.tremorTwMerge)((0,a.getColorClassNames)(t,l.colorPalette.background).bgColor,"bg-opacity-20"):"bg-tremor-background dark:bg-dark-tremor-background",borderColor:"border-tremor-border dark:border-dark-tremor-border",ringColor:""};case"solid":return{textColor:t?(0,a.getColorClassNames)(t,l.colorPalette.text).textColor:"text-tremor-brand-inverted dark:text-dark-tremor-brand-inverted",bgColor:t?(0,o.tremorTwMerge)((0,a.getColorClassNames)(t,l.colorPalette.background).bgColor,"bg-opacity-20"):"bg-tremor-brand dark:bg-dark-tremor-brand",borderColor:"border-tremor-brand-inverted dark:border-dark-tremor-brand-inverted",ringColor:"ring-tremor-ring dark:ring-dark-tremor-ring"};case"outlined":return{textColor:t?(0,a.getColorClassNames)(t,l.colorPalette.text).textColor:"text-tremor-brand dark:text-dark-tremor-brand",bgColor:t?(0,o.tremorTwMerge)((0,a.getColorClassNames)(t,l.colorPalette.background).bgColor,"bg-opacity-20"):"bg-tremor-background dark:bg-dark-tremor-background",borderColor:t?(0,a.getColorClassNames)(t,l.colorPalette.ring).borderColor:"border-tremor-brand-subtle dark:border-dark-tremor-brand-subtle",ringColor:t?(0,o.tremorTwMerge)((0,a.getColorClassNames)(t,l.colorPalette.ring).ringColor,"ring-opacity-40"):"ring-tremor-brand-muted dark:ring-dark-tremor-brand-muted"}}})(g,b),{tooltipProps:w,getReferenceProps:x}=(0,r.useTooltip)();return i.default.createElement("span",Object.assign({ref:(0,a.mergeRefs)([p,w.refs.setReference]),className:(0,o.tremorTwMerge)(m("root"),"inline-flex shrink-0 items-center justify-center",_.bgColor,_.textColor,_.borderColor,_.ringColor,d[g].rounded,d[g].border,d[g].shadow,d[g].ring,s[h].paddingX,s[h].paddingY,$)},x,v),i.default.createElement(r.default,Object.assign({text:f},w)),i.default.createElement(u,{className:(0,o.tremorTwMerge)(m("icon"),"shrink-0",c[h].height,c[h].width)}))});p.displayName="Icon",e.s(["default",()=>p],728889)},591935,e=>{"use strict";var t=e.i(271645);let i=t.forwardRef(function(e,i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:i},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"}))});e.s(["PencilAltIcon",0,i],591935)},292639,e=>{"use strict";var t=e.i(764205),i=e.i(266027);let r=(0,e.i(243652).createQueryKeys)("uiSettings");e.s(["useUISettings",0,()=>(0,i.useQuery)({queryKey:r.list({}),queryFn:async()=>await (0,t.getUiSettings)(),staleTime:36e5,gcTime:36e5})])},209261,e=>{"use strict";e.s(["extractCategories",0,e=>{let t=new Set;return e.forEach(e=>{e.category&&""!==e.category.trim()&&t.add(e.category)}),["All",...Array.from(t).sort(),"Other"]},"filterPluginsByCategory",0,(e,t)=>"All"===t?e:"Other"===t?e.filter(e=>!e.category||""===e.category.trim()):e.filter(e=>e.category===t),"filterPluginsBySearch",0,(e,t)=>{if(!t||""===t.trim())return e;let i=t.toLowerCase().trim();return e.filter(e=>{let t=e.name.toLowerCase().includes(i),r=e.description?.toLowerCase().includes(i)||!1,n=e.keywords?.some(e=>e.toLowerCase().includes(i))||!1;return t||r||n})},"formatDateString",0,e=>{if(!e)return"N/A";try{return new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}catch(e){return"Invalid date"}},"formatInstallCommand",0,e=>"github"===e.source.source&&e.source.repo?`/plugin marketplace add ${e.source.repo}`:"url"===e.source.source&&e.source.url?`/plugin marketplace add ${e.source.url}`:`/plugin marketplace add ${e.name}`,"getCategoryBadgeColor",0,e=>{if(!e)return"gray";let t=e.toLowerCase();if(t.includes("development")||t.includes("dev"))return"blue";if(t.includes("productivity")||t.includes("workflow"))return"green";if(t.includes("learning")||t.includes("education"))return"purple";if(t.includes("security")||t.includes("safety"))return"red";if(t.includes("data")||t.includes("analytics"))return"orange";else if(t.includes("integration")||t.includes("api"))return"yellow";return"gray"},"getSourceDisplayText",0,e=>"github"===e.source&&e.repo?`GitHub: ${e.repo}`:"url"===e.source&&e.url?e.url:"Unknown source","getSourceLink",0,e=>"github"===e.source&&e.repo?`https://github.com/${e.repo}`:"url"===e.source&&e.url?e.url:null,"isValidEmail",0,e=>!e||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),"isValidSemanticVersion",0,e=>!e||/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(e),"isValidUrl",0,e=>{if(!e)return!0;try{return new URL(e),!0}catch{return!1}},"parseKeywords",0,e=>e&&""!==e.trim()?e.split(",").map(e=>e.trim()).filter(e=>""!==e):[],"validatePluginName",0,e=>!!e&&""!==e.trim()&&/^[a-z0-9-]+$/.test(e)])},928685,e=>{"use strict";var t=e.i(38953);e.s(["SearchOutlined",()=>t.default])},280898,e=>{"use strict";e.i(247167);var t=e.i(271645),i=e.i(121229),r=e.i(864517),n=e.i(343794),o=e.i(931067),a=e.i(209428),l=e.i(211577),s=e.i(703923),c=e.i(404948),d=["className","prefixCls","style","active","status","iconPrefix","icon","wrapperStyle","stepNumber","disabled","description","title","subTitle","progressDot","stepIcon","tailContent","icons","stepIndex","onStepClick","onClick","render"];function m(e){return"string"==typeof e}let p=function(e){var i,r,p,u,g,f=e.className,h=e.prefixCls,b=e.style,$=e.active,v=e.status,_=e.iconPrefix,w=e.icon,x=(e.wrapperStyle,e.stepNumber),I=e.disabled,y=e.description,C=e.title,S=e.subTitle,k=e.progressDot,A=e.stepIcon,T=e.tailContent,E=e.icons,N=e.stepIndex,j=e.onStepClick,O=e.onClick,M=e.render,z=(0,s.default)(e,d),R={};j&&!I&&(R.role="button",R.tabIndex=0,R.onClick=function(e){null==O||O(e),j(N)},R.onKeyDown=function(e){var t=e.which;(t===c.default.ENTER||t===c.default.SPACE)&&j(N)});var P=v||"wait",L=(0,n.default)("".concat(h,"-item"),"".concat(h,"-item-").concat(P),f,(g={},(0,l.default)(g,"".concat(h,"-item-custom"),w),(0,l.default)(g,"".concat(h,"-item-active"),$),(0,l.default)(g,"".concat(h,"-item-disabled"),!0===I),g)),D=(0,a.default)({},b),H=t.createElement("div",(0,o.default)({},z,{className:L,style:D}),t.createElement("div",(0,o.default)({onClick:O},R,{className:"".concat(h,"-item-container")}),t.createElement("div",{className:"".concat(h,"-item-tail")},T),t.createElement("div",{className:"".concat(h,"-item-icon")},(p=(0,n.default)("".concat(h,"-icon"),"".concat(_,"icon"),(i={},(0,l.default)(i,"".concat(_,"icon-").concat(w),w&&m(w)),(0,l.default)(i,"".concat(_,"icon-check"),!w&&"finish"===v&&(E&&!E.finish||!E)),(0,l.default)(i,"".concat(_,"icon-cross"),!w&&"error"===v&&(E&&!E.error||!E)),i)),u=t.createElement("span",{className:"".concat(h,"-icon-dot")}),r=k?"function"==typeof k?t.createElement("span",{className:"".concat(h,"-icon")},k(u,{index:x-1,status:v,title:C,description:y})):t.createElement("span",{className:"".concat(h,"-icon")},u):w&&!m(w)?t.createElement("span",{className:"".concat(h,"-icon")},w):E&&E.finish&&"finish"===v?t.createElement("span",{className:"".concat(h,"-icon")},E.finish):E&&E.error&&"error"===v?t.createElement("span",{className:"".concat(h,"-icon")},E.error):w||"finish"===v||"error"===v?t.createElement("span",{className:p}):t.createElement("span",{className:"".concat(h,"-icon")},x),A&&(r=A({index:x-1,status:v,title:C,description:y,node:r})),r)),t.createElement("div",{className:"".concat(h,"-item-content")},t.createElement("div",{className:"".concat(h,"-item-title")},C,S&&t.createElement("div",{title:"string"==typeof S?S:void 0,className:"".concat(h,"-item-subtitle")},S)),y&&t.createElement("div",{className:"".concat(h,"-item-description")},y))));return M&&(H=M(H)||null),H};var u=["prefixCls","style","className","children","direction","type","labelPlacement","iconPrefix","status","size","current","progressDot","stepIcon","initial","icons","onChange","itemRender","items"];function g(e){var i,r=e.prefixCls,c=void 0===r?"rc-steps":r,d=e.style,m=void 0===d?{}:d,g=e.className,f=(e.children,e.direction),h=e.type,b=void 0===h?"default":h,$=e.labelPlacement,v=e.iconPrefix,_=void 0===v?"rc":v,w=e.status,x=void 0===w?"process":w,I=e.size,y=e.current,C=void 0===y?0:y,S=e.progressDot,k=e.stepIcon,A=e.initial,T=void 0===A?0:A,E=e.icons,N=e.onChange,j=e.itemRender,O=e.items,M=(0,s.default)(e,u),z="inline"===b,R=z||void 0!==S&&S,P=z||void 0===f?"horizontal":f,L=z?void 0:I,D=(0,n.default)(c,"".concat(c,"-").concat(P),g,(i={},(0,l.default)(i,"".concat(c,"-").concat(L),L),(0,l.default)(i,"".concat(c,"-label-").concat(R?"vertical":void 0===$?"horizontal":$),"horizontal"===P),(0,l.default)(i,"".concat(c,"-dot"),!!R),(0,l.default)(i,"".concat(c,"-navigation"),"navigation"===b),(0,l.default)(i,"".concat(c,"-inline"),z),i)),H=function(e){N&&C!==e&&N(e)};return t.default.createElement("div",(0,o.default)({className:D,style:m},M),(void 0===O?[]:O).filter(function(e){return e}).map(function(e,i){var r=(0,a.default)({},e),n=T+i;return"error"===x&&i===C-1&&(r.className="".concat(c,"-next-error")),r.status||(n===C?r.status=x:n<C?r.status="finish":r.status="wait"),z&&(r.icon=void 0,r.subTitle=void 0),!r.render&&j&&(r.render=function(e){return j(r,e)}),t.default.createElement(p,(0,o.default)({},r,{active:n===C,stepNumber:n+1,stepIndex:n,key:n,prefixCls:c,iconPrefix:_,wrapperStyle:m,progressDot:R,stepIcon:k,icons:E,onStepClick:N&&H}))}))}g.Step=p;var f=e.i(242064),h=e.i(517455),b=e.i(150073),$=e.i(309821),v=e.i(491816);e.i(296059);var _=e.i(915654),w=e.i(183293),x=e.i(246422),I=e.i(838378);let y=(e,t)=>{let i=`${t.componentCls}-item`,r=`${e}IconColor`,n=`${e}TitleColor`,o=`${e}DescriptionColor`,a=`${e}TailColor`,l=`${e}IconBgColor`,s=`${e}IconBorderColor`,c=`${e}DotColor`;return{[`${i}-${e} ${i}-icon`]:{backgroundColor:t[l],borderColor:t[s],[`> ${t.componentCls}-icon`]:{color:t[r],[`${t.componentCls}-icon-dot`]:{background:t[c]}}},[`${i}-${e}${i}-custom ${i}-icon`]:{[`> ${t.componentCls}-icon`]:{color:t[c]}},[`${i}-${e} > ${i}-container > ${i}-content > ${i}-title`]:{color:t[n],"&::after":{backgroundColor:t[a]}},[`${i}-${e} > ${i}-container > ${i}-content > ${i}-description`]:{color:t[o]},[`${i}-${e} > ${i}-container > ${i}-tail::after`]:{backgroundColor:t[a]}}},C=(0,x.genStyleHooks)("Steps",e=>{let{colorTextDisabled:t,controlHeightLG:i,colorTextLightSolid:r,colorText:n,colorPrimary:o,colorTextDescription:a,colorTextQuaternary:l,colorError:s,colorBorderSecondary:c,colorSplit:d}=e;return(e=>{let{componentCls:t}=e;return{[t]:Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},(0,w.resetComponent)(e)),{display:"flex",width:"100%",fontSize:0,textAlign:"initial"}),(e=>{let{componentCls:t,motionDurationSlow:i}=e,r=`${t}-item`,n=`${r}-icon`;return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({[r]:{position:"relative",display:"inline-block",flex:1,overflow:"hidden",verticalAlign:"top","&:last-child":{flex:"none",[`> ${r}-container > ${r}-tail, > ${r}-container >  ${r}-content > ${r}-title::after`]:{display:"none"}}},[`${r}-container`]:{outline:"none",[`&:focus-visible ${n}`]:(0,w.genFocusOutline)(e)},[`${n}, ${r}-content`]:{display:"inline-block",verticalAlign:"top"},[n]:{width:e.iconSize,height:e.iconSize,marginTop:0,marginBottom:0,marginInlineStart:0,marginInlineEnd:e.marginXS,fontSize:e.iconFontSize,fontFamily:e.fontFamily,lineHeight:(0,_.unit)(e.iconSize),textAlign:"center",borderRadius:e.iconSize,border:`${(0,_.unit)(e.lineWidth)} ${e.lineType} transparent`,transition:`background-color ${i}, border-color ${i}`,[`${t}-icon`]:{position:"relative",top:e.iconTop,color:e.colorPrimary,lineHeight:1}},[`${r}-tail`]:{position:"absolute",top:e.calc(e.iconSize).div(2).equal(),insetInlineStart:0,width:"100%","&::after":{display:"inline-block",width:"100%",height:e.lineWidth,background:e.colorSplit,borderRadius:e.lineWidth,transition:`background ${i}`,content:'""'}},[`${r}-title`]:{position:"relative",display:"inline-block",paddingInlineEnd:e.padding,color:e.colorText,fontSize:e.fontSizeLG,lineHeight:(0,_.unit)(e.titleLineHeight),"&::after":{position:"absolute",top:e.calc(e.titleLineHeight).div(2).equal(),insetInlineStart:"100%",display:"block",width:9999,height:e.lineWidth,background:e.processTailColor,content:'""'}},[`${r}-subtitle`]:{display:"inline",marginInlineStart:e.marginXS,color:e.colorTextDescription,fontWeight:"normal",fontSize:e.fontSize},[`${r}-description`]:{color:e.colorTextDescription,fontSize:e.fontSize}},y("wait",e)),y("process",e)),{[`${r}-process > ${r}-container > ${r}-title`]:{fontWeight:e.fontWeightStrong}}),y("finish",e)),y("error",e)),{[`${r}${t}-next-error > ${t}-item-title::after`]:{background:e.colorError},[`${r}-disabled`]:{cursor:"not-allowed"}})})(e)),(e=>{let{componentCls:t,motionDurationSlow:i}=e;return{[`& ${t}-item`]:{[`&:not(${t}-item-active)`]:{[`& > ${t}-item-container[role='button']`]:{cursor:"pointer",[`${t}-item`]:{[`&-title, &-subtitle, &-description, &-icon ${t}-icon`]:{transition:`color ${i}`}},"&:hover":{[`${t}-item`]:{"&-title, &-subtitle, &-description":{color:e.colorPrimary}}}},[`&:not(${t}-item-process)`]:{[`& > ${t}-item-container[role='button']:hover`]:{[`${t}-item`]:{"&-icon":{borderColor:e.colorPrimary,[`${t}-icon`]:{color:e.colorPrimary}}}}}}},[`&${t}-horizontal:not(${t}-label-vertical)`]:{[`${t}-item`]:{paddingInlineStart:e.padding,whiteSpace:"nowrap","&:first-child":{paddingInlineStart:0},[`&:last-child ${t}-item-title`]:{paddingInlineEnd:0},"&-tail":{display:"none"},"&-description":{maxWidth:e.descriptionMaxWidth,whiteSpace:"normal"}}}}})(e)),(e=>{let{componentCls:t,customIconTop:i,customIconSize:r,customIconFontSize:n}=e;return{[`${t}-item-custom`]:{[`> ${t}-item-container > ${t}-item-icon`]:{height:"auto",background:"none",border:0,[`> ${t}-icon`]:{top:i,width:r,height:r,fontSize:n,lineHeight:(0,_.unit)(r)}}},[`&:not(${t}-vertical)`]:{[`${t}-item-custom`]:{[`${t}-item-icon`]:{width:"auto",background:"none"}}}}})(e)),(e=>{let{componentCls:t,iconSizeSM:i,fontSizeSM:r,fontSize:n,colorTextDescription:o}=e;return{[`&${t}-small`]:{[`&${t}-horizontal:not(${t}-label-vertical) ${t}-item`]:{paddingInlineStart:e.paddingSM,"&:first-child":{paddingInlineStart:0}},[`${t}-item-icon`]:{width:i,height:i,marginTop:0,marginBottom:0,marginInline:`0 ${(0,_.unit)(e.marginXS)}`,fontSize:r,lineHeight:(0,_.unit)(i),textAlign:"center",borderRadius:i},[`${t}-item-title`]:{paddingInlineEnd:e.paddingSM,fontSize:n,lineHeight:(0,_.unit)(i),"&::after":{top:e.calc(i).div(2).equal()}},[`${t}-item-description`]:{color:o,fontSize:n},[`${t}-item-tail`]:{top:e.calc(i).div(2).sub(e.paddingXXS).equal()},[`${t}-item-custom ${t}-item-icon`]:{width:"inherit",height:"inherit",lineHeight:"inherit",background:"none",border:0,borderRadius:0,[`> ${t}-icon`]:{fontSize:i,lineHeight:(0,_.unit)(i),transform:"none"}}}}})(e)),(e=>{let{componentCls:t,iconSizeSM:i,iconSize:r}=e;return{[`&${t}-vertical`]:{display:"flex",flexDirection:"column",[`> ${t}-item`]:{display:"block",flex:"1 0 auto",paddingInlineStart:0,overflow:"visible",[`${t}-item-icon`]:{float:"left",marginInlineEnd:e.margin},[`${t}-item-content`]:{display:"block",minHeight:e.calc(e.controlHeight).mul(1.5).equal(),overflow:"hidden"},[`${t}-item-title`]:{lineHeight:(0,_.unit)(r)},[`${t}-item-description`]:{paddingBottom:e.paddingSM}},[`> ${t}-item > ${t}-item-container > ${t}-item-tail`]:{position:"absolute",top:0,insetInlineStart:e.calc(r).div(2).sub(e.lineWidth).equal(),width:e.lineWidth,height:"100%",padding:`${(0,_.unit)(e.calc(e.marginXXS).mul(1.5).add(r).equal())} 0 ${(0,_.unit)(e.calc(e.marginXXS).mul(1.5).equal())}`,"&::after":{width:e.lineWidth,height:"100%"}},[`> ${t}-item:not(:last-child) > ${t}-item-container > ${t}-item-tail`]:{display:"block"},[` > ${t}-item > ${t}-item-container > ${t}-item-content > ${t}-item-title`]:{"&::after":{display:"none"}},[`&${t}-small ${t}-item-container`]:{[`${t}-item-tail`]:{position:"absolute",top:0,insetInlineStart:e.calc(i).div(2).sub(e.lineWidth).equal(),padding:`${(0,_.unit)(e.calc(e.marginXXS).mul(1.5).add(i).equal())} 0 ${(0,_.unit)(e.calc(e.marginXXS).mul(1.5).equal())}`},[`${t}-item-title`]:{lineHeight:(0,_.unit)(i)}}}}})(e)),(e=>{let{componentCls:t}=e,i=`${t}-item`;return{[`${t}-horizontal`]:{[`${i}-tail`]:{transform:"translateY(-50%)"}}}})(e)),(e=>{let{componentCls:t,iconSize:i,lineHeight:r,iconSizeSM:n}=e;return{[`&${t}-label-vertical`]:{[`${t}-item`]:{overflow:"visible","&-tail":{marginInlineStart:e.calc(i).div(2).add(e.controlHeightLG).equal(),padding:`0 ${(0,_.unit)(e.paddingLG)}`},"&-content":{display:"block",width:e.calc(i).div(2).add(e.controlHeightLG).mul(2).equal(),marginTop:e.marginSM,textAlign:"center"},"&-icon":{display:"inline-block",marginInlineStart:e.controlHeightLG},"&-title":{paddingInlineEnd:0,paddingInlineStart:0,"&::after":{display:"none"}},"&-subtitle":{display:"block",marginBottom:e.marginXXS,marginInlineStart:0,lineHeight:r}},[`&${t}-small:not(${t}-dot)`]:{[`${t}-item`]:{"&-icon":{marginInlineStart:e.calc(i).sub(n).div(2).add(e.controlHeightLG).equal()}}}}}})(e)),(e=>{let{componentCls:t,descriptionMaxWidth:i,lineHeight:r,dotCurrentSize:n,dotSize:o,motionDurationSlow:a}=e;return{[`&${t}-dot, &${t}-dot${t}-small`]:{[`${t}-item`]:{"&-title":{lineHeight:r},"&-tail":{top:e.calc(e.dotSize).sub(e.calc(e.lineWidth).mul(3).equal()).div(2).equal(),width:"100%",marginTop:0,marginBottom:0,marginInline:`${(0,_.unit)(e.calc(i).div(2).equal())} 0`,padding:0,"&::after":{width:`calc(100% - ${(0,_.unit)(e.calc(e.marginSM).mul(2).equal())})`,height:e.calc(e.lineWidth).mul(3).equal(),marginInlineStart:e.marginSM}},"&-icon":{width:o,height:o,marginInlineStart:e.calc(e.descriptionMaxWidth).sub(o).div(2).equal(),paddingInlineEnd:0,lineHeight:(0,_.unit)(o),background:"transparent",border:0,[`${t}-icon-dot`]:{position:"relative",float:"left",width:"100%",height:"100%",borderRadius:100,transition:`all ${a}`,"&::after":{position:"absolute",top:e.calc(e.marginSM).mul(-1).equal(),insetInlineStart:e.calc(o).sub(e.calc(e.controlHeightLG).mul(1.5).equal()).div(2).equal(),width:e.calc(e.controlHeightLG).mul(1.5).equal(),height:e.controlHeight,background:"transparent",content:'""'}}},"&-content":{width:i},[`&-process ${t}-item-icon`]:{position:"relative",top:e.calc(o).sub(n).div(2).equal(),width:n,height:n,lineHeight:(0,_.unit)(n),background:"none",marginInlineStart:e.calc(e.descriptionMaxWidth).sub(n).div(2).equal()},[`&-process ${t}-icon`]:{[`&:first-child ${t}-icon-dot`]:{insetInlineStart:0}}}},[`&${t}-vertical${t}-dot`]:{[`${t}-item-icon`]:{marginTop:e.calc(e.controlHeight).sub(o).div(2).equal(),marginInlineStart:0,background:"none"},[`${t}-item-process ${t}-item-icon`]:{marginTop:e.calc(e.controlHeight).sub(n).div(2).equal(),top:0,insetInlineStart:e.calc(o).sub(n).div(2).equal(),marginInlineStart:0},[`${t}-item > ${t}-item-container > ${t}-item-tail`]:{top:e.calc(e.controlHeight).sub(o).div(2).equal(),insetInlineStart:0,margin:0,padding:`${(0,_.unit)(e.calc(o).add(e.paddingXS).equal())} 0 ${(0,_.unit)(e.paddingXS)}`,"&::after":{marginInlineStart:e.calc(o).sub(e.lineWidth).div(2).equal()}},[`&${t}-small`]:{[`${t}-item-icon`]:{marginTop:e.calc(e.controlHeightSM).sub(o).div(2).equal()},[`${t}-item-process ${t}-item-icon`]:{marginTop:e.calc(e.controlHeightSM).sub(n).div(2).equal()},[`${t}-item > ${t}-item-container > ${t}-item-tail`]:{top:e.calc(e.controlHeightSM).sub(o).div(2).equal()}},[`${t}-item:first-child ${t}-icon-dot`]:{insetInlineStart:0},[`${t}-item-content`]:{width:"inherit"}}}})(e)),(e=>{let{componentCls:t,navContentMaxWidth:i,navArrowColor:r,stepsNavActiveColor:n,motionDurationSlow:o}=e;return{[`&${t}-navigation`]:{paddingTop:e.paddingSM,[`&${t}-small`]:{[`${t}-item`]:{"&-container":{marginInlineStart:e.calc(e.marginSM).mul(-1).equal()}}},[`${t}-item`]:{overflow:"visible",textAlign:"center","&-container":{display:"inline-block",height:"100%",marginInlineStart:e.calc(e.margin).mul(-1).equal(),paddingBottom:e.paddingSM,textAlign:"start",transition:`opacity ${o}`,[`${t}-item-content`]:{maxWidth:i},[`${t}-item-title`]:Object.assign(Object.assign({maxWidth:"100%",paddingInlineEnd:0},w.textEllipsis),{"&::after":{display:"none"}})},[`&:not(${t}-item-active)`]:{[`${t}-item-container[role='button']`]:{cursor:"pointer","&:hover":{opacity:.85}}},"&:last-child":{flex:1,"&::after":{display:"none"}},"&::after":{position:"absolute",top:`calc(50% - ${(0,_.unit)(e.calc(e.paddingSM).div(2).equal())})`,insetInlineStart:"100%",display:"inline-block",width:e.fontSizeIcon,height:e.fontSizeIcon,borderTop:`${(0,_.unit)(e.lineWidth)} ${e.lineType} ${r}`,borderBottom:"none",borderInlineStart:"none",borderInlineEnd:`${(0,_.unit)(e.lineWidth)} ${e.lineType} ${r}`,transform:"translateY(-50%) translateX(-50%) rotate(45deg)",content:'""'},"&::before":{position:"absolute",bottom:0,insetInlineStart:"50%",display:"inline-block",width:0,height:e.lineWidthBold,backgroundColor:n,transition:`width ${o}, inset-inline-start ${o}`,transitionTimingFunction:"ease-out",content:'""'}},[`${t}-item${t}-item-active::before`]:{insetInlineStart:0,width:"100%"}},[`&${t}-navigation${t}-vertical`]:{[`> ${t}-item`]:{marginInlineEnd:0,"&::before":{display:"none"},[`&${t}-item-active::before`]:{top:0,insetInlineEnd:0,insetInlineStart:"unset",display:"block",width:e.calc(e.lineWidth).mul(3).equal(),height:`calc(100% - ${(0,_.unit)(e.marginLG)})`},"&::after":{position:"relative",insetInlineStart:"50%",display:"block",width:e.calc(e.controlHeight).mul(.25).equal(),height:e.calc(e.controlHeight).mul(.25).equal(),marginBottom:e.marginXS,textAlign:"center",transform:"translateY(-50%) translateX(-50%) rotate(135deg)"},"&:last-child":{"&::after":{display:"none"}},[`> ${t}-item-container > ${t}-item-tail`]:{visibility:"hidden"}}},[`&${t}-navigation${t}-horizontal`]:{[`> ${t}-item > ${t}-item-container > ${t}-item-tail`]:{visibility:"hidden"}}}})(e)),(e=>{let{componentCls:t}=e;return{[`&${t}-rtl`]:{direction:"rtl",[`${t}-item`]:{"&-subtitle":{float:"left"}},[`&${t}-navigation`]:{[`${t}-item::after`]:{transform:"rotate(-45deg)"}},[`&${t}-vertical`]:{[`> ${t}-item`]:{"&::after":{transform:"rotate(225deg)"},[`${t}-item-icon`]:{float:"right"}}},[`&${t}-dot`]:{[`${t}-item-icon ${t}-icon-dot, &${t}-small ${t}-item-icon ${t}-icon-dot`]:{float:"right"}}}}})(e)),(e=>{let{antCls:t,componentCls:i,iconSize:r,iconSizeSM:n,processIconColor:o,marginXXS:a,lineWidthBold:l,lineWidth:s,paddingXXS:c}=e,d=e.calc(r).add(e.calc(l).mul(4).equal()).equal(),m=e.calc(n).add(e.calc(e.lineWidth).mul(4).equal()).equal();return{[`&${i}-with-progress`]:{[`${i}-item`]:{paddingTop:c,[`&-process ${i}-item-container ${i}-item-icon ${i}-icon`]:{color:o}},[`&${i}-vertical > ${i}-item `]:{paddingInlineStart:c,[`> ${i}-item-container > ${i}-item-tail`]:{top:a,insetInlineStart:e.calc(r).div(2).sub(s).add(c).equal()}},[`&, &${i}-small`]:{[`&${i}-horizontal ${i}-item:first-child`]:{paddingBottom:c,paddingInlineStart:c}},[`&${i}-small${i}-vertical > ${i}-item > ${i}-item-container > ${i}-item-tail`]:{insetInlineStart:e.calc(n).div(2).sub(s).add(c).equal()},[`&${i}-label-vertical ${i}-item ${i}-item-tail`]:{top:e.calc(r).div(2).add(c).equal()},[`${i}-item-icon`]:{position:"relative",[`${t}-progress`]:{position:"absolute",insetInlineStart:"50%",top:"50%",transform:"translate(-50%, -50%)","&-inner":{width:`${(0,_.unit)(d)} !important`,height:`${(0,_.unit)(d)} !important`}}},[`&${i}-small`]:{[`&${i}-label-vertical ${i}-item ${i}-item-tail`]:{top:e.calc(n).div(2).add(c).equal()},[`${i}-item-icon ${t}-progress-inner`]:{width:`${(0,_.unit)(m)} !important`,height:`${(0,_.unit)(m)} !important`}}}}})(e)),(e=>{let{componentCls:t,inlineDotSize:i,inlineTitleColor:r,inlineTailColor:n}=e,o=e.calc(e.paddingXS).add(e.lineWidth).equal(),a={[`${t}-item-container ${t}-item-content ${t}-item-title`]:{color:r}};return{[`&${t}-inline`]:{width:"auto",display:"inline-flex",[`${t}-item`]:{flex:"none","&-container":{padding:`${(0,_.unit)(o)} ${(0,_.unit)(e.paddingXXS)} 0`,margin:`0 ${(0,_.unit)(e.calc(e.marginXXS).div(2).equal())}`,borderRadius:e.borderRadiusSM,cursor:"pointer",transition:`background-color ${e.motionDurationMid}`,"&:hover":{background:e.controlItemBgHover},"&[role='button']:hover":{opacity:1}},"&-icon":{width:i,height:i,marginInlineStart:`calc(50% - ${(0,_.unit)(e.calc(i).div(2).equal())})`,[`> ${t}-icon`]:{top:0},[`${t}-icon-dot`]:{borderRadius:e.calc(e.fontSizeSM).div(4).equal(),"&::after":{display:"none"}}},"&-content":{width:"auto",marginTop:e.calc(e.marginXS).sub(e.lineWidth).equal()},"&-title":{color:r,fontSize:e.fontSizeSM,lineHeight:e.lineHeightSM,fontWeight:"normal",marginBottom:e.calc(e.marginXXS).div(2).equal()},"&-description":{display:"none"},"&-tail":{marginInlineStart:0,top:e.calc(i).div(2).add(o).equal(),transform:"translateY(-50%)","&:after":{width:"100%",height:e.lineWidth,borderRadius:0,marginInlineStart:0,background:n}},[`&:first-child ${t}-item-tail`]:{width:"50%",marginInlineStart:"50%"},[`&:last-child ${t}-item-tail`]:{display:"block",width:"50%"},"&-wait":Object.assign({[`${t}-item-icon ${t}-icon ${t}-icon-dot`]:{backgroundColor:e.colorBorderBg,border:`${(0,_.unit)(e.lineWidth)} ${e.lineType} ${n}`}},a),"&-finish":Object.assign({[`${t}-item-tail::after`]:{backgroundColor:n},[`${t}-item-icon ${t}-icon ${t}-icon-dot`]:{backgroundColor:n,border:`${(0,_.unit)(e.lineWidth)} ${e.lineType} ${n}`}},a),"&-error":a,"&-active, &-process":Object.assign({[`${t}-item-icon`]:{width:i,height:i,marginInlineStart:`calc(50% - ${(0,_.unit)(e.calc(i).div(2).equal())})`,top:0}},a),[`&:not(${t}-item-active) > ${t}-item-container[role='button']:hover`]:{[`${t}-item-title`]:{color:r}}}}}})(e))}})((0,I.mergeToken)(e,{processIconColor:r,processTitleColor:n,processDescriptionColor:n,processIconBgColor:o,processIconBorderColor:o,processDotColor:o,processTailColor:d,waitTitleColor:a,waitDescriptionColor:a,waitTailColor:d,waitDotColor:t,finishIconColor:o,finishTitleColor:n,finishDescriptionColor:a,finishTailColor:o,finishDotColor:o,errorIconColor:r,errorTitleColor:s,errorDescriptionColor:s,errorTailColor:d,errorIconBgColor:s,errorIconBorderColor:s,errorDotColor:s,stepsNavActiveColor:o,stepsProgressSize:i,inlineDotSize:6,inlineTitleColor:l,inlineTailColor:c}))},e=>({titleLineHeight:e.controlHeight,customIconSize:e.controlHeight,customIconTop:0,customIconFontSize:e.controlHeightSM,iconSize:e.controlHeight,iconTop:-.5,iconFontSize:e.fontSize,iconSizeSM:e.fontSizeHeading3,dotSize:e.controlHeight/4,dotCurrentSize:e.controlHeightLG/4,navArrowColor:e.colorTextDisabled,navContentMaxWidth:"unset",descriptionMaxWidth:140,waitIconColor:e.wireframe?e.colorTextDisabled:e.colorTextLabel,waitIconBgColor:e.wireframe?e.colorBgContainer:e.colorFillContent,waitIconBorderColor:e.wireframe?e.colorTextDisabled:"transparent",finishIconBgColor:e.wireframe?e.colorBgContainer:e.controlItemBgActive,finishIconBorderColor:e.wireframe?e.colorPrimary:e.controlItemBgActive}));var S=e.i(876556),k=function(e,t){var i={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&0>t.indexOf(r)&&(i[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var n=0,r=Object.getOwnPropertySymbols(e);n<r.length;n++)0>t.indexOf(r[n])&&Object.prototype.propertyIsEnumerable.call(e,r[n])&&(i[r[n]]=e[r[n]]);return i};let A=e=>{var o,a;let{percent:l,size:s,className:c,rootClassName:d,direction:m,items:p,responsive:u=!0,current:_=0,children:w,style:x}=e,I=k(e,["percent","size","className","rootClassName","direction","items","responsive","current","children","style"]),{xs:y}=(0,b.default)(u),{getPrefixCls:A,direction:T,className:E,style:N}=(0,f.useComponentConfig)("steps"),j=t.useMemo(()=>u&&y?"vertical":m,[u,y,m]),O=(0,h.default)(s),M=A("steps",e.prefixCls),[z,R,P]=C(M),L="inline"===e.type,D=A("",e.iconPrefix),H=(o=p,a=w,o?o:(0,S.default)(a).map(e=>{if(t.isValidElement(e)){let{props:t}=e;return Object.assign({},t)}return null}).filter(e=>e)),q=L?void 0:l,B=Object.assign(Object.assign({},N),x),W=(0,n.default)(E,{[`${M}-rtl`]:"rtl"===T,[`${M}-with-progress`]:void 0!==q},c,d,R,P),G={finish:t.createElement(i.default,{className:`${M}-finish-icon`}),error:t.createElement(r.default,{className:`${M}-error-icon`})};return z(t.createElement(g,Object.assign({icons:G},I,{style:B,current:_,size:O,items:H,itemRender:L?(e,i)=>e.description?t.createElement(v.default,{title:e.description},i):i:void 0,stepIcon:({node:e,status:i})=>"process"===i&&void 0!==q?t.createElement("div",{className:`${M}-progress-icon`},t.createElement($.default,{type:"circle",percent:q,size:"small"===O?32:40,strokeWidth:4,format:()=>null}),e):e,direction:j,prefixCls:M,iconPrefix:D,className:W})))};A.Step=g.Step,e.s(["Steps",0,A],280898)}]);