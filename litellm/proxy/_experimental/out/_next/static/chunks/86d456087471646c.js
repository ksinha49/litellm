(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,62478,e=>{"use strict";var t=e.i(764205);let a=async e=>{if(!e)return null;try{return await (0,t.getProxyUISettings)(e)}catch(e){return console.error("Error fetching proxy settings:",e),null}};e.s(["fetchProxySettings",0,a])},818581,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"useMergedRef",{enumerable:!0,get:function(){return i}});let o=e.r(271645);function i(e,t){let a=(0,o.useRef)(null),i=(0,o.useRef)(null);return(0,o.useCallback)(o=>{if(null===o){let e=a.current;e&&(a.current=null,e());let t=i.current;t&&(i.current=null,t())}else e&&(a.current=n(e,o)),t&&(i.current=n(t,o))},[e,t])}function n(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let a=e(t);return"function"==typeof a?a:()=>e(null)}}("function"==typeof a.default||"object"==typeof a.default&&null!==a.default)&&void 0===a.default.__esModule&&(Object.defineProperty(a.default,"__esModule",{value:!0}),Object.assign(a.default,a),t.exports=a.default)},602073,e=>{"use strict";e.i(247167);var t=e.i(931067),a=e.i(271645);let o={icon:{tag:"svg",attrs:{viewBox:"0 0 1024 1024",focusable:"false"},children:[{tag:"path",attrs:{d:"M512 64L128 192v384c0 212.1 171.9 384 384 384s384-171.9 384-384V192L512 64zm312 512c0 172.3-139.7 312-312 312S200 748.3 200 576V246l312-110 312 110v330z"}},{tag:"path",attrs:{d:"M378.4 475.1a35.91 35.91 0 00-50.9 0 35.91 35.91 0 000 50.9l129.4 129.4 2.1 2.1a33.98 33.98 0 0048.1 0L730.6 434a33.98 33.98 0 000-48.1l-2.8-2.8a33.98 33.98 0 00-48.1 0L483 579.7 378.4 475.1z"}}]},name:"safety",theme:"outlined"};var i=e.i(9583),n=a.forwardRef(function(e,n){return a.createElement(i.default,(0,t.default)({},e,{ref:n,icon:o}))});e.s(["SafetyOutlined",0,n],602073)},190272,785913,e=>{"use strict";var t,a,o=((t={}).AUDIO_SPEECH="audio_speech",t.AUDIO_TRANSCRIPTION="audio_transcription",t.IMAGE_GENERATION="image_generation",t.VIDEO_GENERATION="video_generation",t.CHAT="chat",t.RESPONSES="responses",t.IMAGE_EDITS="image_edits",t.ANTHROPIC_MESSAGES="anthropic_messages",t.EMBEDDING="embedding",t),i=((a={}).IMAGE="image",a.VIDEO="video",a.CHAT="chat",a.RESPONSES="responses",a.IMAGE_EDITS="image_edits",a.ANTHROPIC_MESSAGES="anthropic_messages",a.EMBEDDINGS="embeddings",a.SPEECH="speech",a.TRANSCRIPTION="transcription",a.A2A_AGENTS="a2a_agents",a.MCP="mcp",a);let n={image_generation:"image",video_generation:"video",chat:"chat",responses:"responses",image_edits:"image_edits",anthropic_messages:"anthropic_messages",audio_speech:"speech",audio_transcription:"transcription",embedding:"embeddings"};e.s(["EndpointType",()=>i,"getEndpointType",0,e=>{if(console.log("getEndpointType:",e),Object.values(o).includes(e)){let t=n[e];return console.log("endpointType:",t),t}return"chat"}],785913),e.s(["generateCodeSnippet",0,e=>{let t,{apiKeySource:a,accessToken:o,apiKey:n,inputMessage:r,chatHistory:l,selectedTags:s,selectedVectorStores:p,selectedGuardrails:c,selectedPolicies:g,selectedMCPServers:m,mcpServers:u,mcpServerToolRestrictions:d,selectedVoice:f,endpointType:_,selectedModel:h,selectedSdk:b,proxySettings:y}=e,v="session"===a?o:n,I=window.location.origin,x=y?.LITELLM_UI_API_DOC_BASE_URL;x&&x.trim()?I=x:y?.PROXY_BASE_URL&&(I=y.PROXY_BASE_URL);let A=r||"Your prompt here",C=A.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n"),w=l.filter(e=>!e.isImage).map(({role:e,content:t})=>({role:e,content:t})),S={};s.length>0&&(S.tags=s),p.length>0&&(S.vector_stores=p),c.length>0&&(S.guardrails=c),g.length>0&&(S.policies=g);let $=h||"your-model-name",k="azure"===b?`import openai

client = openai.AzureOpenAI(
	api_key="${v||"YOUR_LITELLM_API_KEY"}",
	azure_endpoint="${I}",
	api_version="2024-02-01"
)`:`import openai

client = openai.OpenAI(
	api_key="${v||"YOUR_LITELLM_API_KEY"}",
	base_url="${I}"
)`;switch(_){case i.CHAT:{let e=Object.keys(S).length>0,a="";if(e){let e=JSON.stringify({metadata:S},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();a=`,
    extra_body=${e}`}let o=w.length>0?w:[{role:"user",content:A}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.chat.completions.create(
    model="${$}",
    messages=${JSON.stringify(o,null,4)}${a}
)

print(response)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.chat.completions.create(
#     model="${$}",
#     messages=[
#         {
#             "role": "user",
#             "content": [
#                 {
#                     "type": "text",
#                     "text": "${C}"
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
`;break}case i.RESPONSES:{let e=Object.keys(S).length>0,a="";if(e){let e=JSON.stringify({metadata:S},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();a=`,
    extra_body=${e}`}let o=w.length>0?w:[{role:"user",content:A}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.responses.create(
    model="${$}",
    input=${JSON.stringify(o,null,4)}${a}
)

print(response.output_text)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.responses.create(
#     model="${$}",
#     input=[
#         {
#             "role": "user",
#             "content": [
#                 {"type": "input_text", "text": "${C}"},
#                 {
#                     "type": "input_image",
#                     "image_url": f"data:image/jpeg;base64,{base64_file}",  # or data:application/pdf;base64,{base64_file}
#                 },
#             ],
#         }
#     ]${a}
# )
# print(response_with_file.output_text)
`;break}case i.IMAGE:t="azure"===b?`
# NOTE: The Azure SDK does not have a direct equivalent to the multi-modal 'responses.create' method shown for OpenAI.
# This snippet uses 'client.images.generate' and will create a new image based on your prompt.
# It does not use the uploaded image, as 'client.images.generate' does not support image inputs in this context.
import os
import requests
import json
import time
from PIL import Image

result = client.images.generate(
	model="${$}",
	prompt="${r}",
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
prompt = "${C}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${$}",
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
`;break;case i.IMAGE_EDITS:t="azure"===b?`
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
prompt = "${C}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${$}",
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
prompt = "${C}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${$}",
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
`;break;case i.EMBEDDINGS:t=`
response = client.embeddings.create(
	input="${r||"Your string here"}",
	model="${$}",
	encoding_format="base64" # or "float"
)

print(response.data[0].embedding)
`;break;case i.TRANSCRIPTION:t=`
# Open the audio file
audio_file = open("path/to/your/audio/file.mp3", "rb")

# Make the transcription request
response = client.audio.transcriptions.create(
	model="${$}",
	file=audio_file${r?`,
	prompt="${r.replace(/"/g,'\\"')}"`:""}
)

print(response.text)
`;break;case i.SPEECH:t=`
# Make the text-to-speech request
response = client.audio.speech.create(
	model="${$}",
	input="${r||"Your text to convert to speech here"}",
	voice="${f}"  # Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
)

# Save the audio to a file
output_filename = "output_speech.mp3"
response.stream_to_file(output_filename)
print(f"Audio saved to {output_filename}")

# Optional: Customize response format and speed
# response = client.audio.speech.create(
#     model="${$}",
#     input="${r||"Your text to convert to speech here"}",
#     voice="alloy",
#     response_format="mp3",  # Options: mp3, opus, aac, flac, wav, pcm
#     speed=1.0  # Range: 0.25 to 4.0
# )
# response.stream_to_file("output_speech.mp3")
`;break;default:t="\n# Code generation for this endpoint is not implemented yet."}return`${k}
${t}`}],190272)},798496,e=>{"use strict";var t=e.i(843476),a=e.i(152990),o=e.i(682830),i=e.i(271645),n=e.i(269200),r=e.i(427612),l=e.i(64848),s=e.i(942232),p=e.i(496020),c=e.i(977572),g=e.i(94629),m=e.i(360820),u=e.i(871943);function d({data:e=[],columns:d,isLoading:f=!1,defaultSorting:_=[],pagination:h,onPaginationChange:b,enablePagination:y=!1}){let[v,I]=i.default.useState(_),[x]=i.default.useState("onChange"),[A,C]=i.default.useState({}),[w,S]=i.default.useState({}),$=(0,a.useReactTable)({data:e,columns:d,state:{sorting:v,columnSizing:A,columnVisibility:w,...y&&h?{pagination:h}:{}},columnResizeMode:x,onSortingChange:I,onColumnSizingChange:C,onColumnVisibilityChange:S,...y&&b?{onPaginationChange:b}:{},getCoreRowModel:(0,o.getCoreRowModel)(),getSortedRowModel:(0,o.getSortedRowModel)(),...y?{getPaginationRowModel:(0,o.getPaginationRowModel)()}:{},enableSorting:!0,enableColumnResizing:!0,defaultColumn:{minSize:40,maxSize:500}});return(0,t.jsx)("div",{className:"rounded-lg custom-border relative",children:(0,t.jsx)("div",{className:"overflow-x-auto",children:(0,t.jsx)("div",{className:"relative min-w-full",children:(0,t.jsxs)(n.Table,{className:"[&_td]:py-2 [&_th]:py-2",style:{width:$.getTotalSize(),minWidth:"100%",tableLayout:"fixed"},children:[(0,t.jsx)(r.TableHead,{children:$.getHeaderGroups().map(e=>(0,t.jsx)(p.TableRow,{children:e.headers.map(e=>(0,t.jsxs)(l.TableHeaderCell,{className:`py-1 h-8 relative ${"actions"===e.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.id?120:e.getSize(),position:"actions"===e.id?"sticky":"relative",right:"actions"===e.id?0:"auto"},onClick:e.column.getCanSort()?e.column.getToggleSortingHandler():void 0,children:[(0,t.jsxs)("div",{className:"flex items-center justify-between gap-2",children:[(0,t.jsx)("div",{className:"flex items-center",children:e.isPlaceholder?null:(0,a.flexRender)(e.column.columnDef.header,e.getContext())}),"actions"!==e.id&&e.column.getCanSort()&&(0,t.jsx)("div",{className:"w-4",children:e.column.getIsSorted()?({asc:(0,t.jsx)(m.ChevronUpIcon,{className:"h-4 w-4 text-blue-500"}),desc:(0,t.jsx)(u.ChevronDownIcon,{className:"h-4 w-4 text-blue-500"})})[e.column.getIsSorted()]:(0,t.jsx)(g.SwitchVerticalIcon,{className:"h-4 w-4 text-gray-400"})})]}),e.column.getCanResize()&&(0,t.jsx)("div",{onMouseDown:e.getResizeHandler(),onTouchStart:e.getResizeHandler(),className:`absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none ${e.column.getIsResizing()?"bg-blue-500":"hover:bg-blue-200"}`})]},e.id))},e.id))}),(0,t.jsx)(s.TableBody,{children:f?(0,t.jsx)(p.TableRow,{children:(0,t.jsx)(c.TableCell,{colSpan:d.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"🚅 Loading models..."})})})}):$.getRowModel().rows.length>0?$.getRowModel().rows.map(e=>(0,t.jsx)(p.TableRow,{children:e.getVisibleCells().map(e=>(0,t.jsx)(c.TableCell,{className:`py-0.5 overflow-hidden ${"actions"===e.column.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.column.id?120:e.column.getSize(),position:"actions"===e.column.id?"sticky":"relative",right:"actions"===e.column.id?0:"auto"},children:(0,a.flexRender)(e.column.columnDef.cell,e.getContext())},e.id))},e.id)):(0,t.jsx)(p.TableRow,{children:(0,t.jsx)(c.TableCell,{colSpan:d.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"No models found"})})})})})]})})})})}e.s(["ModelDataTable",()=>d])},434626,e=>{"use strict";var t=e.i(271645);let a=t.forwardRef(function(e,a){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:a},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"}))});e.s(["ExternalLinkIcon",0,a],434626)},94629,e=>{"use strict";var t=e.i(271645);let a=t.forwardRef(function(e,a){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:a},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"}))});e.s(["SwitchVerticalIcon",0,a],94629)},916925,e=>{"use strict";var t,a=((t={}).A2A_Agent="A2A Agent",t.AIML="AI/ML API",t.Bedrock="Amazon Bedrock",t.Anthropic="Anthropic",t.AssemblyAI="AssemblyAI",t.SageMaker="AWS SageMaker",t.Azure="Azure",t.Azure_AI_Studio="Azure AI Foundry (Studio)",t.Cerebras="Cerebras",t.Cohere="Cohere",t.Dashscope="Dashscope",t.Databricks="Databricks (Qwen API)",t.DeepInfra="DeepInfra",t.Deepgram="Deepgram",t.Deepseek="Deepseek",t.ElevenLabs="ElevenLabs",t.FalAI="Fal AI",t.FireworksAI="Fireworks AI",t.Google_AI_Studio="Google AI Studio",t.GradientAI="GradientAI",t.Groq="Groq",t.Hosted_Vllm="vllm",t.Infinity="Infinity",t.JinaAI="Jina AI",t.MiniMax="MiniMax",t.MistralAI="Mistral AI",t.Ollama="Ollama",t.OpenAI="OpenAI",t.OpenAI_Compatible="OpenAI-Compatible Endpoints (Together AI, etc.)",t.OpenAI_Text="OpenAI Text Completion",t.OpenAI_Text_Compatible="OpenAI-Compatible Text Completion Models (Together AI, etc.)",t.Openrouter="Openrouter",t.Oracle="Oracle Cloud Infrastructure (OCI)",t.Perplexity="Perplexity",t.RunwayML="RunwayML",t.Sambanova="Sambanova",t.Snowflake="Snowflake",t.TogetherAI="TogetherAI",t.Triton="Triton",t.Vertex_AI="Vertex AI (Anthropic, Gemini, etc.)",t.VolcEngine="VolcEngine",t.Voyage="Voyage AI",t.xAI="xAI",t.SAP="SAP Generative AI Hub",t.Watsonx="Watsonx",t);let o={A2A_Agent:"a2a_agent",AIML:"aiml",OpenAI:"openai",OpenAI_Text:"text-completion-openai",Azure:"azure",Azure_AI_Studio:"azure_ai",Anthropic:"anthropic",Google_AI_Studio:"gemini",Bedrock:"bedrock",Groq:"groq",MiniMax:"minimax",MistralAI:"mistral",Cohere:"cohere",OpenAI_Compatible:"openai",OpenAI_Text_Compatible:"text-completion-openai",Vertex_AI:"vertex_ai",Databricks:"databricks",Dashscope:"dashscope",xAI:"xai",Deepseek:"deepseek",Ollama:"ollama",AssemblyAI:"assemblyai",Cerebras:"cerebras",Sambanova:"sambanova",Perplexity:"perplexity",RunwayML:"runwayml",TogetherAI:"together_ai",Openrouter:"openrouter",Oracle:"oci",Snowflake:"snowflake",FireworksAI:"fireworks_ai",GradientAI:"gradient_ai",Triton:"triton",Deepgram:"deepgram",ElevenLabs:"elevenlabs",FalAI:"fal_ai",SageMaker:"sagemaker_chat",Voyage:"voyage",JinaAI:"jina_ai",VolcEngine:"volcengine",DeepInfra:"deepinfra",Hosted_Vllm:"hosted_vllm",Infinity:"infinity",SAP:"sap",Watsonx:"watsonx"},i="../ui/assets/logos/",n={"A2A Agent":`${i}a2a_agent.png`,"AI/ML API":`${i}aiml_api.svg`,Anthropic:`${i}anthropic.svg`,AssemblyAI:`${i}assemblyai_small.png`,Azure:`${i}microsoft_azure.svg`,"Azure AI Foundry (Studio)":`${i}microsoft_azure.svg`,"Amazon Bedrock":`${i}bedrock.svg`,"AWS SageMaker":`${i}bedrock.svg`,Cerebras:`${i}cerebras.svg`,Cohere:`${i}cohere.svg`,"Databricks (Qwen API)":`${i}databricks.svg`,Dashscope:`${i}dashscope.svg`,Deepseek:`${i}deepseek.svg`,"Fireworks AI":`${i}fireworks.svg`,Groq:`${i}groq.svg`,"Google AI Studio":`${i}google.svg`,vllm:`${i}vllm.png`,Infinity:`${i}infinity.png`,MiniMax:`${i}minimax.svg`,"Mistral AI":`${i}mistral.svg`,Ollama:`${i}ollama.svg`,OpenAI:`${i}openai_small.svg`,"OpenAI Text Completion":`${i}openai_small.svg`,"OpenAI-Compatible Text Completion Models (Together AI, etc.)":`${i}openai_small.svg`,"OpenAI-Compatible Endpoints (Together AI, etc.)":`${i}openai_small.svg`,Openrouter:`${i}openrouter.svg`,"Oracle Cloud Infrastructure (OCI)":`${i}oracle.svg`,Perplexity:`${i}perplexity-ai.svg`,RunwayML:`${i}runwayml.png`,Sambanova:`${i}sambanova.svg`,Snowflake:`${i}snowflake.svg`,TogetherAI:`${i}togetherai.svg`,"Vertex AI (Anthropic, Gemini, etc.)":`${i}google.svg`,xAI:`${i}xai.svg`,GradientAI:`${i}gradientai.svg`,Triton:`${i}nvidia_triton.png`,Deepgram:`${i}deepgram.png`,ElevenLabs:`${i}elevenlabs.png`,"Fal AI":`${i}fal_ai.jpg`,"Voyage AI":`${i}voyage.webp`,"Jina AI":`${i}jina.png`,VolcEngine:`${i}volcengine.png`,DeepInfra:`${i}deepinfra.png`,"SAP Generative AI Hub":`${i}sap.png`};e.s(["Providers",()=>a,"getPlaceholder",0,e=>{if("AI/ML API"===e)return"aiml/flux-pro/v1.1";if("Vertex AI (Anthropic, Gemini, etc.)"===e)return"gemini-pro";if("Anthropic"==e)return"claude-3-opus";if("Amazon Bedrock"==e)return"claude-3-opus";if("AWS SageMaker"==e)return"sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b";else if("Google AI Studio"==e)return"gemini-pro";else if("Azure AI Foundry (Studio)"==e)return"azure_ai/command-r-plus";else if("Azure"==e)return"my-deployment";else if("Oracle Cloud Infrastructure (OCI)"==e)return"oci/xai.grok-4";else if("Snowflake"==e)return"snowflake/mistral-7b";else if("Voyage AI"==e)return"voyage/";else if("Jina AI"==e)return"jina_ai/";else if("VolcEngine"==e)return"volcengine/<any-model-on-volcengine>";else if("DeepInfra"==e)return"deepinfra/<any-model-on-deepinfra>";else if("Fal AI"==e)return"fal_ai/fal-ai/flux-pro/v1.1-ultra";else if("RunwayML"==e)return"runwayml/gen4_turbo";else if("Watsonx"===e)return"watsonx/ibm/granite-3-3-8b-instruct";else return"gpt-3.5-turbo"},"getProviderLogoAndName",0,e=>{if(!e)return{logo:"",displayName:"-"};if("gemini"===e.toLowerCase()){let e="Google AI Studio";return{logo:n[e],displayName:e}}let t=Object.keys(o).find(t=>o[t].toLowerCase()===e.toLowerCase());if(!t)return{logo:"",displayName:e};let i=a[t];return{logo:n[i],displayName:i}},"getProviderModels",0,(e,t)=>{console.log(`Provider key: ${e}`);let a=o[e];console.log(`Provider mapped to: ${a}`);let i=[];return e&&"object"==typeof t&&(Object.entries(t).forEach(([e,t])=>{if(null!==t&&"object"==typeof t&&"litellm_provider"in t){let o=t.litellm_provider;(o===a||"string"==typeof o&&o.includes(a))&&i.push(e)}}),"Cohere"==e&&(console.log("Adding cohere chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"cohere_chat"===t.litellm_provider&&i.push(e)})),"AWS SageMaker"==e&&(console.log("Adding sagemaker chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"sagemaker_chat"===t.litellm_provider&&i.push(e)}))),i},"providerLogoMap",0,n,"provider_map",0,o])},771674,e=>{"use strict";e.i(247167);var t=e.i(931067),a=e.i(271645);let o={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"}}]},name:"user",theme:"outlined"};var i=e.i(9583),n=a.forwardRef(function(e,n){return a.createElement(i.default,(0,t.default)({},e,{ref:n,icon:o}))});e.s(["UserOutlined",0,n],771674)},262218,e=>{"use strict";e.i(247167);var t=e.i(271645),a=e.i(343794),o=e.i(529681),i=e.i(702779),n=e.i(563113),r=e.i(763731),l=e.i(121872),s=e.i(242064);e.i(296059);var p=e.i(915654);e.i(262370);var c=e.i(135551),g=e.i(183293),m=e.i(246422),u=e.i(838378);let d=e=>{let{lineWidth:t,fontSizeIcon:a,calc:o}=e,i=e.fontSizeSM;return(0,u.mergeToken)(e,{tagFontSize:i,tagLineHeight:(0,p.unit)(o(e.lineHeightSM).mul(i).equal()),tagIconSize:o(a).sub(o(t).mul(2)).equal(),tagPaddingHorizontal:8,tagBorderlessBg:e.defaultBg})},f=e=>({defaultBg:new c.FastColor(e.colorFillQuaternary).onBackground(e.colorBgContainer).toHexString(),defaultColor:e.colorText}),_=(0,m.genStyleHooks)("Tag",e=>(e=>{let{paddingXXS:t,lineWidth:a,tagPaddingHorizontal:o,componentCls:i,calc:n}=e,r=n(o).sub(a).equal(),l=n(t).sub(a).equal();return{[i]:Object.assign(Object.assign({},(0,g.resetComponent)(e)),{display:"inline-block",height:"auto",marginInlineEnd:e.marginXS,paddingInline:r,fontSize:e.tagFontSize,lineHeight:e.tagLineHeight,whiteSpace:"nowrap",background:e.defaultBg,border:`${(0,p.unit)(e.lineWidth)} ${e.lineType} ${e.colorBorder}`,borderRadius:e.borderRadiusSM,opacity:1,transition:`all ${e.motionDurationMid}`,textAlign:"start",position:"relative",[`&${i}-rtl`]:{direction:"rtl"},"&, a, a:hover":{color:e.defaultColor},[`${i}-close-icon`]:{marginInlineStart:l,fontSize:e.tagIconSize,color:e.colorIcon,cursor:"pointer",transition:`all ${e.motionDurationMid}`,"&:hover":{color:e.colorTextHeading}},[`&${i}-has-color`]:{borderColor:"transparent",[`&, a, a:hover, ${e.iconCls}-close, ${e.iconCls}-close:hover`]:{color:e.colorTextLightSolid}},"&-checkable":{backgroundColor:"transparent",borderColor:"transparent",cursor:"pointer",[`&:not(${i}-checkable-checked):hover`]:{color:e.colorPrimary,backgroundColor:e.colorFillSecondary},"&:active, &-checked":{color:e.colorTextLightSolid},"&-checked":{backgroundColor:e.colorPrimary,"&:hover":{backgroundColor:e.colorPrimaryHover}},"&:active":{backgroundColor:e.colorPrimaryActive}},"&-hidden":{display:"none"},[`> ${e.iconCls} + span, > span + ${e.iconCls}`]:{marginInlineStart:r}}),[`${i}-borderless`]:{borderColor:"transparent",background:e.tagBorderlessBg}}})(d(e)),f);var h=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&0>t.indexOf(o)&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var i=0,o=Object.getOwnPropertySymbols(e);i<o.length;i++)0>t.indexOf(o[i])&&Object.prototype.propertyIsEnumerable.call(e,o[i])&&(a[o[i]]=e[o[i]]);return a};let b=t.forwardRef((e,o)=>{let{prefixCls:i,style:n,className:r,checked:l,children:p,icon:c,onChange:g,onClick:m}=e,u=h(e,["prefixCls","style","className","checked","children","icon","onChange","onClick"]),{getPrefixCls:d,tag:f}=t.useContext(s.ConfigContext),b=d("tag",i),[y,v,I]=_(b),x=(0,a.default)(b,`${b}-checkable`,{[`${b}-checkable-checked`]:l},null==f?void 0:f.className,r,v,I);return y(t.createElement("span",Object.assign({},u,{ref:o,style:Object.assign(Object.assign({},n),null==f?void 0:f.style),className:x,onClick:e=>{null==g||g(!l),null==m||m(e)}}),c,t.createElement("span",null,p)))});var y=e.i(403541);let v=(0,m.genSubStyleComponent)(["Tag","preset"],e=>{let t;return t=d(e),(0,y.genPresetColor)(t,(e,{textColor:a,lightBorderColor:o,lightColor:i,darkColor:n})=>({[`${t.componentCls}${t.componentCls}-${e}`]:{color:a,background:i,borderColor:o,"&-inverse":{color:t.colorTextLightSolid,background:n,borderColor:n},[`&${t.componentCls}-borderless`]:{borderColor:"transparent"}}}))},f),I=(e,t,a)=>{let o="string"!=typeof a?a:a.charAt(0).toUpperCase()+a.slice(1);return{[`${e.componentCls}${e.componentCls}-${t}`]:{color:e[`color${a}`],background:e[`color${o}Bg`],borderColor:e[`color${o}Border`],[`&${e.componentCls}-borderless`]:{borderColor:"transparent"}}}},x=(0,m.genSubStyleComponent)(["Tag","status"],e=>{let t=d(e);return[I(t,"success","Success"),I(t,"processing","Info"),I(t,"error","Error"),I(t,"warning","Warning")]},f);var A=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&0>t.indexOf(o)&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var i=0,o=Object.getOwnPropertySymbols(e);i<o.length;i++)0>t.indexOf(o[i])&&Object.prototype.propertyIsEnumerable.call(e,o[i])&&(a[o[i]]=e[o[i]]);return a};let C=t.forwardRef((e,p)=>{let{prefixCls:c,className:g,rootClassName:m,style:u,children:d,icon:f,color:h,onClose:b,bordered:y=!0,visible:I}=e,C=A(e,["prefixCls","className","rootClassName","style","children","icon","color","onClose","bordered","visible"]),{getPrefixCls:w,direction:S,tag:$}=t.useContext(s.ConfigContext),[k,O]=t.useState(!0),j=(0,o.default)(C,["closeIcon","closable"]);t.useEffect(()=>{void 0!==I&&O(I)},[I]);let E=(0,i.isPresetColor)(h),T=(0,i.isPresetStatusColor)(h),M=E||T,P=Object.assign(Object.assign({backgroundColor:h&&!M?h:void 0},null==$?void 0:$.style),u),N=w("tag",c),[R,L,z]=_(N),D=(0,a.default)(N,null==$?void 0:$.className,{[`${N}-${h}`]:M,[`${N}-has-color`]:h&&!M,[`${N}-hidden`]:!k,[`${N}-rtl`]:"rtl"===S,[`${N}-borderless`]:!y},g,m,L,z),H=e=>{e.stopPropagation(),null==b||b(e),e.defaultPrevented||O(!1)},[,G]=(0,n.useClosable)((0,n.pickClosable)(e),(0,n.pickClosable)($),{closable:!1,closeIconRender:e=>{let o=t.createElement("span",{className:`${N}-close-icon`,onClick:H},e);return(0,r.replaceElement)(e,o,e=>({onClick:t=>{var a;null==(a=null==e?void 0:e.onClick)||a.call(e,t),H(t)},className:(0,a.default)(null==e?void 0:e.className,`${N}-close-icon`)}))}}),B="function"==typeof C.onClick||d&&"a"===d.type,F=f||null,V=F?t.createElement(t.Fragment,null,F,d&&t.createElement("span",null,d)):d,q=t.createElement("span",Object.assign({},j,{ref:p,className:D,style:P}),V,G,E&&t.createElement(v,{key:"preset",prefixCls:N}),T&&t.createElement(x,{key:"status",prefixCls:N}));return R(B?t.createElement(l.default,{component:"Tag"},q):q)});C.CheckableTag=b,e.s(["Tag",0,C],262218)},653496,e=>{"use strict";var t=e.i(721369);e.s(["Tabs",()=>t.default])},100486,e=>{"use strict";e.i(247167);var t=e.i(931067),a=e.i(271645);let o={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M899.6 276.5L705 396.4 518.4 147.5a8.06 8.06 0 00-12.9 0L319 396.4 124.3 276.5c-5.7-3.5-13.1 1.2-12.2 7.9L188.5 865c1.1 7.9 7.9 14 16 14h615.1c8 0 14.9-6 15.9-14l76.4-580.6c.8-6.7-6.5-11.4-12.3-7.9zm-126 534.1H250.3l-53.8-409.4 139.8 86.1L512 252.9l175.7 234.4 139.8-86.1-53.9 409.4zM512 509c-62.1 0-112.6 50.5-112.6 112.6S449.9 734.2 512 734.2s112.6-50.5 112.6-112.6S574.1 509 512 509zm0 160.9c-26.6 0-48.2-21.6-48.2-48.3 0-26.6 21.6-48.3 48.2-48.3s48.2 21.6 48.2 48.3c0 26.6-21.6 48.3-48.2 48.3z"}}]},name:"crown",theme:"outlined"};var i=e.i(9583),n=a.forwardRef(function(e,n){return a.createElement(i.default,(0,t.default)({},e,{ref:n,icon:o}))});e.s(["CrownOutlined",0,n],100486)}]);