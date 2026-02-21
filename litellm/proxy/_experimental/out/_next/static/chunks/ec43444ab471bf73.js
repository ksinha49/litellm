(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,62478,e=>{"use strict";var t=e.i(764205);let a=async e=>{if(!e)return null;try{return await (0,t.getProxyUISettings)(e)}catch(e){return console.error("Error fetching proxy settings:",e),null}};e.s(["fetchProxySettings",0,a])},602073,e=>{"use strict";e.i(247167);var t=e.i(931067),a=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"0 0 1024 1024",focusable:"false"},children:[{tag:"path",attrs:{d:"M512 64L128 192v384c0 212.1 171.9 384 384 384s384-171.9 384-384V192L512 64zm312 512c0 172.3-139.7 312-312 312S200 748.3 200 576V246l312-110 312 110v330z"}},{tag:"path",attrs:{d:"M378.4 475.1a35.91 35.91 0 00-50.9 0 35.91 35.91 0 000 50.9l129.4 129.4 2.1 2.1a33.98 33.98 0 0048.1 0L730.6 434a33.98 33.98 0 000-48.1l-2.8-2.8a33.98 33.98 0 00-48.1 0L483 579.7 378.4 475.1z"}}]},name:"safety",theme:"outlined"};var i=e.i(9583),o=a.forwardRef(function(e,o){return a.createElement(i.default,(0,t.default)({},e,{ref:o,icon:r}))});e.s(["SafetyOutlined",0,o],602073)},771674,e=>{"use strict";e.i(247167);var t=e.i(931067),a=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"}}]},name:"user",theme:"outlined"};var i=e.i(9583),o=a.forwardRef(function(e,o){return a.createElement(i.default,(0,t.default)({},e,{ref:o,icon:r}))});e.s(["UserOutlined",0,o],771674)},818581,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"useMergedRef",{enumerable:!0,get:function(){return i}});let r=e.r(271645);function i(e,t){let a=(0,r.useRef)(null),i=(0,r.useRef)(null);return(0,r.useCallback)(r=>{if(null===r){let e=a.current;e&&(a.current=null,e());let t=i.current;t&&(i.current=null,t())}else e&&(a.current=o(e,r)),t&&(i.current=o(t,r))},[e,t])}function o(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let a=e(t);return"function"==typeof a?a:()=>e(null)}}("function"==typeof a.default||"object"==typeof a.default&&null!==a.default)&&void 0===a.default.__esModule&&(Object.defineProperty(a.default,"__esModule",{value:!0}),Object.assign(a.default,a),t.exports=a.default)},190272,785913,e=>{"use strict";var t,a,r=((t={}).AUDIO_SPEECH="audio_speech",t.AUDIO_TRANSCRIPTION="audio_transcription",t.IMAGE_GENERATION="image_generation",t.VIDEO_GENERATION="video_generation",t.CHAT="chat",t.RESPONSES="responses",t.IMAGE_EDITS="image_edits",t.ANTHROPIC_MESSAGES="anthropic_messages",t.EMBEDDING="embedding",t),i=((a={}).IMAGE="image",a.VIDEO="video",a.CHAT="chat",a.RESPONSES="responses",a.IMAGE_EDITS="image_edits",a.ANTHROPIC_MESSAGES="anthropic_messages",a.EMBEDDINGS="embeddings",a.SPEECH="speech",a.TRANSCRIPTION="transcription",a.A2A_AGENTS="a2a_agents",a.MCP="mcp",a);let o={image_generation:"image",video_generation:"video",chat:"chat",responses:"responses",image_edits:"image_edits",anthropic_messages:"anthropic_messages",audio_speech:"speech",audio_transcription:"transcription",embedding:"embeddings"};e.s(["EndpointType",()=>i,"getEndpointType",0,e=>{if(console.log("getEndpointType:",e),Object.values(r).includes(e)){let t=o[e];return console.log("endpointType:",t),t}return"chat"}],785913),e.s(["generateCodeSnippet",0,e=>{let t,{apiKeySource:a,accessToken:r,apiKey:o,inputMessage:n,chatHistory:l,selectedTags:s,selectedVectorStores:c,selectedGuardrails:p,selectedPolicies:d,selectedMCPServers:u,mcpServers:m,mcpServerToolRestrictions:g,selectedVoice:f,endpointType:h,selectedModel:_,selectedSdk:b,proxySettings:v}=e,y="session"===a?r:o,x=window.location.origin,w=v?.LITELLM_UI_API_DOC_BASE_URL;w&&w.trim()?x=w:v?.PROXY_BASE_URL&&(x=v.PROXY_BASE_URL);let I=n||"Your prompt here",A=I.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n"),C=l.filter(e=>!e.isImage).map(({role:e,content:t})=>({role:e,content:t})),S={};s.length>0&&(S.tags=s),c.length>0&&(S.vector_stores=c),p.length>0&&(S.guardrails=p),d.length>0&&(S.policies=d);let k=_||"your-model-name",$="azure"===b?`import openai

client = openai.AzureOpenAI(
	api_key="${y||"YOUR_LITELLM_API_KEY"}",
	azure_endpoint="${x}",
	api_version="2024-02-01"
)`:`import openai

client = openai.OpenAI(
	api_key="${y||"YOUR_LITELLM_API_KEY"}",
	base_url="${x}"
)`;switch(h){case i.CHAT:{let e=Object.keys(S).length>0,a="";if(e){let e=JSON.stringify({metadata:S},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();a=`,
    extra_body=${e}`}let r=C.length>0?C:[{role:"user",content:I}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.chat.completions.create(
    model="${k}",
    messages=${JSON.stringify(r,null,4)}${a}
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
#                     "text": "${A}"
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
    extra_body=${e}`}let r=C.length>0?C:[{role:"user",content:I}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.responses.create(
    model="${k}",
    input=${JSON.stringify(r,null,4)}${a}
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
#                 {"type": "input_text", "text": "${A}"},
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
	model="${k}",
	prompt="${n}",
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
prompt = "${A}"

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
prompt = "${A}"

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
prompt = "${A}"

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
`;break;case i.EMBEDDINGS:t=`
response = client.embeddings.create(
	input="${n||"Your string here"}",
	model="${k}",
	encoding_format="base64" # or "float"
)

print(response.data[0].embedding)
`;break;case i.TRANSCRIPTION:t=`
# Open the audio file
audio_file = open("path/to/your/audio/file.mp3", "rb")

# Make the transcription request
response = client.audio.transcriptions.create(
	model="${k}",
	file=audio_file${n?`,
	prompt="${n.replace(/"/g,'\\"')}"`:""}
)

print(response.text)
`;break;case i.SPEECH:t=`
# Make the text-to-speech request
response = client.audio.speech.create(
	model="${k}",
	input="${n||"Your text to convert to speech here"}",
	voice="${f}"  # Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
)

# Save the audio to a file
output_filename = "output_speech.mp3"
response.stream_to_file(output_filename)
print(f"Audio saved to {output_filename}")

# Optional: Customize response format and speed
# response = client.audio.speech.create(
#     model="${k}",
#     input="${n||"Your text to convert to speech here"}",
#     voice="alloy",
#     response_format="mp3",  # Options: mp3, opus, aac, flac, wav, pcm
#     speed=1.0  # Range: 0.25 to 4.0
# )
# response.stream_to_file("output_speech.mp3")
`;break;default:t="\n# Code generation for this endpoint is not implemented yet."}return`${$}
${t}`}],190272)},798496,e=>{"use strict";var t=e.i(843476),a=e.i(152990),r=e.i(682830),i=e.i(271645),o=e.i(269200),n=e.i(427612),l=e.i(64848),s=e.i(942232),c=e.i(496020),p=e.i(977572),d=e.i(94629),u=e.i(360820),m=e.i(871943);function g({data:e=[],columns:g,isLoading:f=!1,defaultSorting:h=[],pagination:_,onPaginationChange:b,enablePagination:v=!1}){let[y,x]=i.default.useState(h),[w]=i.default.useState("onChange"),[I,A]=i.default.useState({}),[C,S]=i.default.useState({}),k=(0,a.useReactTable)({data:e,columns:g,state:{sorting:y,columnSizing:I,columnVisibility:C,...v&&_?{pagination:_}:{}},columnResizeMode:w,onSortingChange:x,onColumnSizingChange:A,onColumnVisibilityChange:S,...v&&b?{onPaginationChange:b}:{},getCoreRowModel:(0,r.getCoreRowModel)(),getSortedRowModel:(0,r.getSortedRowModel)(),...v?{getPaginationRowModel:(0,r.getPaginationRowModel)()}:{},enableSorting:!0,enableColumnResizing:!0,defaultColumn:{minSize:40,maxSize:500}});return(0,t.jsx)("div",{className:"rounded-lg custom-border relative",children:(0,t.jsx)("div",{className:"overflow-x-auto",children:(0,t.jsx)("div",{className:"relative min-w-full",children:(0,t.jsxs)(o.Table,{className:"[&_td]:py-2 [&_th]:py-2",style:{width:k.getTotalSize(),minWidth:"100%",tableLayout:"fixed"},children:[(0,t.jsx)(n.TableHead,{children:k.getHeaderGroups().map(e=>(0,t.jsx)(c.TableRow,{children:e.headers.map(e=>(0,t.jsxs)(l.TableHeaderCell,{className:`py-1 h-8 relative ${"actions"===e.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.id?120:e.getSize(),position:"actions"===e.id?"sticky":"relative",right:"actions"===e.id?0:"auto"},onClick:e.column.getCanSort()?e.column.getToggleSortingHandler():void 0,children:[(0,t.jsxs)("div",{className:"flex items-center justify-between gap-2",children:[(0,t.jsx)("div",{className:"flex items-center",children:e.isPlaceholder?null:(0,a.flexRender)(e.column.columnDef.header,e.getContext())}),"actions"!==e.id&&e.column.getCanSort()&&(0,t.jsx)("div",{className:"w-4",children:e.column.getIsSorted()?({asc:(0,t.jsx)(u.ChevronUpIcon,{className:"h-4 w-4 text-blue-500"}),desc:(0,t.jsx)(m.ChevronDownIcon,{className:"h-4 w-4 text-blue-500"})})[e.column.getIsSorted()]:(0,t.jsx)(d.SwitchVerticalIcon,{className:"h-4 w-4 text-gray-400"})})]}),e.column.getCanResize()&&(0,t.jsx)("div",{onMouseDown:e.getResizeHandler(),onTouchStart:e.getResizeHandler(),className:`absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none ${e.column.getIsResizing()?"bg-blue-500":"hover:bg-blue-200"}`})]},e.id))},e.id))}),(0,t.jsx)(s.TableBody,{children:f?(0,t.jsx)(c.TableRow,{children:(0,t.jsx)(p.TableCell,{colSpan:g.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"🚅 Loading models..."})})})}):k.getRowModel().rows.length>0?k.getRowModel().rows.map(e=>(0,t.jsx)(c.TableRow,{children:e.getVisibleCells().map(e=>(0,t.jsx)(p.TableCell,{className:`py-0.5 overflow-hidden ${"actions"===e.column.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.column.id?120:e.column.getSize(),position:"actions"===e.column.id?"sticky":"relative",right:"actions"===e.column.id?0:"auto"},children:(0,a.flexRender)(e.column.columnDef.cell,e.getContext())},e.id))},e.id)):(0,t.jsx)(c.TableRow,{children:(0,t.jsx)(p.TableCell,{colSpan:g.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"No models found"})})})})})]})})})})}e.s(["ModelDataTable",()=>g])},94629,e=>{"use strict";var t=e.i(271645);let a=t.forwardRef(function(e,a){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:a},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"}))});e.s(["SwitchVerticalIcon",0,a],94629)},262218,e=>{"use strict";e.i(247167);var t=e.i(271645),a=e.i(343794),r=e.i(529681),i=e.i(702779),o=e.i(563113),n=e.i(763731),l=e.i(121872),s=e.i(242064);e.i(296059);var c=e.i(915654);e.i(262370);var p=e.i(135551),d=e.i(183293),u=e.i(246422),m=e.i(838378);let g=e=>{let{lineWidth:t,fontSizeIcon:a,calc:r}=e,i=e.fontSizeSM;return(0,m.mergeToken)(e,{tagFontSize:i,tagLineHeight:(0,c.unit)(r(e.lineHeightSM).mul(i).equal()),tagIconSize:r(a).sub(r(t).mul(2)).equal(),tagPaddingHorizontal:8,tagBorderlessBg:e.defaultBg})},f=e=>({defaultBg:new p.FastColor(e.colorFillQuaternary).onBackground(e.colorBgContainer).toHexString(),defaultColor:e.colorText}),h=(0,u.genStyleHooks)("Tag",e=>(e=>{let{paddingXXS:t,lineWidth:a,tagPaddingHorizontal:r,componentCls:i,calc:o}=e,n=o(r).sub(a).equal(),l=o(t).sub(a).equal();return{[i]:Object.assign(Object.assign({},(0,d.resetComponent)(e)),{display:"inline-block",height:"auto",marginInlineEnd:e.marginXS,paddingInline:n,fontSize:e.tagFontSize,lineHeight:e.tagLineHeight,whiteSpace:"nowrap",background:e.defaultBg,border:`${(0,c.unit)(e.lineWidth)} ${e.lineType} ${e.colorBorder}`,borderRadius:e.borderRadiusSM,opacity:1,transition:`all ${e.motionDurationMid}`,textAlign:"start",position:"relative",[`&${i}-rtl`]:{direction:"rtl"},"&, a, a:hover":{color:e.defaultColor},[`${i}-close-icon`]:{marginInlineStart:l,fontSize:e.tagIconSize,color:e.colorIcon,cursor:"pointer",transition:`all ${e.motionDurationMid}`,"&:hover":{color:e.colorTextHeading}},[`&${i}-has-color`]:{borderColor:"transparent",[`&, a, a:hover, ${e.iconCls}-close, ${e.iconCls}-close:hover`]:{color:e.colorTextLightSolid}},"&-checkable":{backgroundColor:"transparent",borderColor:"transparent",cursor:"pointer",[`&:not(${i}-checkable-checked):hover`]:{color:e.colorPrimary,backgroundColor:e.colorFillSecondary},"&:active, &-checked":{color:e.colorTextLightSolid},"&-checked":{backgroundColor:e.colorPrimary,"&:hover":{backgroundColor:e.colorPrimaryHover}},"&:active":{backgroundColor:e.colorPrimaryActive}},"&-hidden":{display:"none"},[`> ${e.iconCls} + span, > span + ${e.iconCls}`]:{marginInlineStart:n}}),[`${i}-borderless`]:{borderColor:"transparent",background:e.tagBorderlessBg}}})(g(e)),f);var _=function(e,t){var a={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&0>t.indexOf(r)&&(a[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var i=0,r=Object.getOwnPropertySymbols(e);i<r.length;i++)0>t.indexOf(r[i])&&Object.prototype.propertyIsEnumerable.call(e,r[i])&&(a[r[i]]=e[r[i]]);return a};let b=t.forwardRef((e,r)=>{let{prefixCls:i,style:o,className:n,checked:l,children:c,icon:p,onChange:d,onClick:u}=e,m=_(e,["prefixCls","style","className","checked","children","icon","onChange","onClick"]),{getPrefixCls:g,tag:f}=t.useContext(s.ConfigContext),b=g("tag",i),[v,y,x]=h(b),w=(0,a.default)(b,`${b}-checkable`,{[`${b}-checkable-checked`]:l},null==f?void 0:f.className,n,y,x);return v(t.createElement("span",Object.assign({},m,{ref:r,style:Object.assign(Object.assign({},o),null==f?void 0:f.style),className:w,onClick:e=>{null==d||d(!l),null==u||u(e)}}),p,t.createElement("span",null,c)))});var v=e.i(403541);let y=(0,u.genSubStyleComponent)(["Tag","preset"],e=>{let t;return t=g(e),(0,v.genPresetColor)(t,(e,{textColor:a,lightBorderColor:r,lightColor:i,darkColor:o})=>({[`${t.componentCls}${t.componentCls}-${e}`]:{color:a,background:i,borderColor:r,"&-inverse":{color:t.colorTextLightSolid,background:o,borderColor:o},[`&${t.componentCls}-borderless`]:{borderColor:"transparent"}}}))},f),x=(e,t,a)=>{let r="string"!=typeof a?a:a.charAt(0).toUpperCase()+a.slice(1);return{[`${e.componentCls}${e.componentCls}-${t}`]:{color:e[`color${a}`],background:e[`color${r}Bg`],borderColor:e[`color${r}Border`],[`&${e.componentCls}-borderless`]:{borderColor:"transparent"}}}},w=(0,u.genSubStyleComponent)(["Tag","status"],e=>{let t=g(e);return[x(t,"success","Success"),x(t,"processing","Info"),x(t,"error","Error"),x(t,"warning","Warning")]},f);var I=function(e,t){var a={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&0>t.indexOf(r)&&(a[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var i=0,r=Object.getOwnPropertySymbols(e);i<r.length;i++)0>t.indexOf(r[i])&&Object.prototype.propertyIsEnumerable.call(e,r[i])&&(a[r[i]]=e[r[i]]);return a};let A=t.forwardRef((e,c)=>{let{prefixCls:p,className:d,rootClassName:u,style:m,children:g,icon:f,color:_,onClose:b,bordered:v=!0,visible:x}=e,A=I(e,["prefixCls","className","rootClassName","style","children","icon","color","onClose","bordered","visible"]),{getPrefixCls:C,direction:S,tag:k}=t.useContext(s.ConfigContext),[$,E]=t.useState(!0),O=(0,r.default)(A,["closeIcon","closable"]);t.useEffect(()=>{void 0!==x&&E(x)},[x]);let j=(0,i.isPresetColor)(_),T=(0,i.isPresetStatusColor)(_),M=j||T,N=Object.assign(Object.assign({backgroundColor:_&&!M?_:void 0},null==k?void 0:k.style),m),R=C("tag",p),[P,L,z]=h(R),D=(0,a.default)(R,null==k?void 0:k.className,{[`${R}-${_}`]:M,[`${R}-has-color`]:_&&!M,[`${R}-hidden`]:!$,[`${R}-rtl`]:"rtl"===S,[`${R}-borderless`]:!v},d,u,L,z),H=e=>{e.stopPropagation(),null==b||b(e),e.defaultPrevented||E(!1)},[,B]=(0,o.useClosable)((0,o.pickClosable)(e),(0,o.pickClosable)(k),{closable:!1,closeIconRender:e=>{let r=t.createElement("span",{className:`${R}-close-icon`,onClick:H},e);return(0,n.replaceElement)(e,r,e=>({onClick:t=>{var a;null==(a=null==e?void 0:e.onClick)||a.call(e,t),H(t)},className:(0,a.default)(null==e?void 0:e.className,`${R}-close-icon`)}))}}),G="function"==typeof A.onClick||g&&"a"===g.type,V=f||null,F=V?t.createElement(t.Fragment,null,V,g&&t.createElement("span",null,g)):g,q=t.createElement("span",Object.assign({},O,{ref:c,className:D,style:N}),F,B,j&&t.createElement(y,{key:"preset",prefixCls:R}),T&&t.createElement(w,{key:"status",prefixCls:R}));return P(G?t.createElement(l.default,{component:"Tag"},q):q)});A.CheckableTag=b,e.s(["Tag",0,A],262218)},653496,e=>{"use strict";var t=e.i(721369);e.s(["Tabs",()=>t.default])},190144,e=>{"use strict";e.i(247167);var t=e.i(931067),a=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.2c3.5 1.3 7.2 2 11 2H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM664 888H414V746c0-22.1-17.9-40-40-40H232V264h432v624z"}}]},name:"copy",theme:"outlined"};var i=e.i(9583),o=a.forwardRef(function(e,o){return a.createElement(i.default,(0,t.default)({},e,{ref:o,icon:r}))});e.s(["default",0,o],190144)},464571,e=>{"use strict";var t=e.i(920228);e.s(["Button",()=>t.default])},735049,e=>{"use strict";var t=e.i(654310),a=function(e){if((0,t.default)()&&window.document.documentElement){var a=Array.isArray(e)?e:[e],r=window.document.documentElement;return a.some(function(e){return e in r.style})}return!1},r=function(e,t){if(!a(e))return!1;var r=document.createElement("div"),i=r.style[e];return r.style[e]=t,r.style[e]!==i};function i(e,t){return Array.isArray(e)||void 0===t?a(e):r(e,t)}e.s(["isStyleSupport",()=>i])},401361,e=>{"use strict";e.i(247167);var t=e.i(931067),a=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"}}]},name:"edit",theme:"outlined"};var i=e.i(9583),o=a.forwardRef(function(e,o){return a.createElement(i.default,(0,t.default)({},e,{ref:o,icon:r}))});e.s(["default",0,o],401361)},959013,e=>{"use strict";e.i(247167);var t=e.i(931067),a=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"}},{tag:"path",attrs:{d:"M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8z"}}]},name:"plus",theme:"outlined"};var i=e.i(9583),o=a.forwardRef(function(e,o){return a.createElement(i.default,(0,t.default)({},e,{ref:o,icon:r}))});e.s(["default",0,o],959013)},269200,e=>{"use strict";var t=e.i(290571),a=e.i(271645),r=e.i(444755);let i=(0,e.i(673706).makeClassName)("Table"),o=a.default.forwardRef((e,o)=>{let{children:n,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return a.default.createElement("div",{className:(0,r.tremorTwMerge)(i("root"),"overflow-auto",l)},a.default.createElement("table",Object.assign({ref:o,className:(0,r.tremorTwMerge)(i("table"),"w-full text-tremor-default","text-tremor-content","dark:text-dark-tremor-content")},s),n))});o.displayName="Table",e.s(["Table",()=>o],269200)},427612,e=>{"use strict";var t=e.i(290571),a=e.i(271645),r=e.i(444755);let i=(0,e.i(673706).makeClassName)("TableHead"),o=a.default.forwardRef((e,o)=>{let{children:n,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return a.default.createElement(a.default.Fragment,null,a.default.createElement("thead",Object.assign({ref:o,className:(0,r.tremorTwMerge)(i("root"),"text-left","text-tremor-content","dark:text-dark-tremor-content",l)},s),n))});o.displayName="TableHead",e.s(["TableHead",()=>o],427612)},64848,e=>{"use strict";var t=e.i(290571),a=e.i(271645),r=e.i(444755);let i=(0,e.i(673706).makeClassName)("TableHeaderCell"),o=a.default.forwardRef((e,o)=>{let{children:n,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return a.default.createElement(a.default.Fragment,null,a.default.createElement("th",Object.assign({ref:o,className:(0,r.tremorTwMerge)(i("root"),"whitespace-nowrap text-left font-semibold top-0 px-4 py-3.5","text-tremor-content-strong","dark:text-dark-tremor-content-strong",l)},s),n))});o.displayName="TableHeaderCell",e.s(["TableHeaderCell",()=>o],64848)},942232,e=>{"use strict";var t=e.i(290571),a=e.i(271645),r=e.i(444755);let i=(0,e.i(673706).makeClassName)("TableBody"),o=a.default.forwardRef((e,o)=>{let{children:n,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return a.default.createElement(a.default.Fragment,null,a.default.createElement("tbody",Object.assign({ref:o,className:(0,r.tremorTwMerge)(i("root"),"align-top divide-y","divide-tremor-border","dark:divide-dark-tremor-border",l)},s),n))});o.displayName="TableBody",e.s(["TableBody",()=>o],942232)},496020,e=>{"use strict";var t=e.i(290571),a=e.i(271645),r=e.i(444755);let i=(0,e.i(673706).makeClassName)("TableRow"),o=a.default.forwardRef((e,o)=>{let{children:n,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return a.default.createElement(a.default.Fragment,null,a.default.createElement("tr",Object.assign({ref:o,className:(0,r.tremorTwMerge)(i("row"),l)},s),n))});o.displayName="TableRow",e.s(["TableRow",()=>o],496020)},977572,e=>{"use strict";var t=e.i(290571),a=e.i(271645),r=e.i(444755);let i=(0,e.i(673706).makeClassName)("TableCell"),o=a.default.forwardRef((e,o)=>{let{children:n,className:l}=e,s=(0,t.__rest)(e,["children","className"]);return a.default.createElement(a.default.Fragment,null,a.default.createElement("td",Object.assign({ref:o,className:(0,r.tremorTwMerge)(i("root"),"align-middle whitespace-nowrap text-left p-4",l)},s),n))});o.displayName="TableCell",e.s(["TableCell",()=>o],977572)},360820,e=>{"use strict";var t=e.i(271645);let a=t.forwardRef(function(e,a){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:a},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M5 15l7-7 7 7"}))});e.s(["ChevronUpIcon",0,a],360820)},871943,e=>{"use strict";var t=e.i(271645);let a=t.forwardRef(function(e,a){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:a},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M19 9l-7 7-7-7"}))});e.s(["ChevronDownIcon",0,a],871943)},991124,e=>{"use strict";let t=(0,e.i(475254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["default",()=>t])},916925,e=>{"use strict";var t,a=((t={}).A2A_Agent="A2A Agent",t.AIML="AI/ML API",t.Bedrock="Amazon Bedrock",t.Anthropic="Anthropic",t.AssemblyAI="AssemblyAI",t.SageMaker="AWS SageMaker",t.Azure="Azure",t.Azure_AI_Studio="Azure AI Foundry (Studio)",t.Cerebras="Cerebras",t.Cohere="Cohere",t.Dashscope="Dashscope",t.Databricks="Databricks (Qwen API)",t.DeepInfra="DeepInfra",t.Deepgram="Deepgram",t.Deepseek="Deepseek",t.ElevenLabs="ElevenLabs",t.FalAI="Fal AI",t.FireworksAI="Fireworks AI",t.Google_AI_Studio="Google AI Studio",t.GradientAI="GradientAI",t.Groq="Groq",t.Hosted_Vllm="vllm",t.Infinity="Infinity",t.JinaAI="Jina AI",t.MiniMax="MiniMax",t.MistralAI="Mistral AI",t.Ollama="Ollama",t.OpenAI="OpenAI",t.OpenAI_Compatible="OpenAI-Compatible Endpoints (Together AI, etc.)",t.OpenAI_Text="OpenAI Text Completion",t.OpenAI_Text_Compatible="OpenAI-Compatible Text Completion Models (Together AI, etc.)",t.Openrouter="Openrouter",t.Oracle="Oracle Cloud Infrastructure (OCI)",t.Perplexity="Perplexity",t.RunwayML="RunwayML",t.Sambanova="Sambanova",t.Snowflake="Snowflake",t.TogetherAI="TogetherAI",t.Triton="Triton",t.Vertex_AI="Vertex AI (Anthropic, Gemini, etc.)",t.VolcEngine="VolcEngine",t.Voyage="Voyage AI",t.xAI="xAI",t.SAP="SAP Generative AI Hub",t.Watsonx="Watsonx",t);let r={A2A_Agent:"a2a_agent",AIML:"aiml",OpenAI:"openai",OpenAI_Text:"text-completion-openai",Azure:"azure",Azure_AI_Studio:"azure_ai",Anthropic:"anthropic",Google_AI_Studio:"gemini",Bedrock:"bedrock",Groq:"groq",MiniMax:"minimax",MistralAI:"mistral",Cohere:"cohere",OpenAI_Compatible:"openai",OpenAI_Text_Compatible:"text-completion-openai",Vertex_AI:"vertex_ai",Databricks:"databricks",Dashscope:"dashscope",xAI:"xai",Deepseek:"deepseek",Ollama:"ollama",AssemblyAI:"assemblyai",Cerebras:"cerebras",Sambanova:"sambanova",Perplexity:"perplexity",RunwayML:"runwayml",TogetherAI:"together_ai",Openrouter:"openrouter",Oracle:"oci",Snowflake:"snowflake",FireworksAI:"fireworks_ai",GradientAI:"gradient_ai",Triton:"triton",Deepgram:"deepgram",ElevenLabs:"elevenlabs",FalAI:"fal_ai",SageMaker:"sagemaker_chat",Voyage:"voyage",JinaAI:"jina_ai",VolcEngine:"volcengine",DeepInfra:"deepinfra",Hosted_Vllm:"hosted_vllm",Infinity:"infinity",SAP:"sap",Watsonx:"watsonx"},i="../ui/assets/logos/",o={"A2A Agent":`${i}a2a_agent.png`,"AI/ML API":`${i}aiml_api.svg`,Anthropic:`${i}anthropic.svg`,AssemblyAI:`${i}assemblyai_small.png`,Azure:`${i}microsoft_azure.svg`,"Azure AI Foundry (Studio)":`${i}microsoft_azure.svg`,"Amazon Bedrock":`${i}bedrock.svg`,"AWS SageMaker":`${i}bedrock.svg`,Cerebras:`${i}cerebras.svg`,Cohere:`${i}cohere.svg`,"Databricks (Qwen API)":`${i}databricks.svg`,Dashscope:`${i}dashscope.svg`,Deepseek:`${i}deepseek.svg`,"Fireworks AI":`${i}fireworks.svg`,Groq:`${i}groq.svg`,"Google AI Studio":`${i}google.svg`,vllm:`${i}vllm.png`,Infinity:`${i}infinity.png`,MiniMax:`${i}minimax.svg`,"Mistral AI":`${i}mistral.svg`,Ollama:`${i}ollama.svg`,OpenAI:`${i}openai_small.svg`,"OpenAI Text Completion":`${i}openai_small.svg`,"OpenAI-Compatible Text Completion Models (Together AI, etc.)":`${i}openai_small.svg`,"OpenAI-Compatible Endpoints (Together AI, etc.)":`${i}openai_small.svg`,Openrouter:`${i}openrouter.svg`,"Oracle Cloud Infrastructure (OCI)":`${i}oracle.svg`,Perplexity:`${i}perplexity-ai.svg`,RunwayML:`${i}runwayml.png`,Sambanova:`${i}sambanova.svg`,Snowflake:`${i}snowflake.svg`,TogetherAI:`${i}togetherai.svg`,"Vertex AI (Anthropic, Gemini, etc.)":`${i}google.svg`,xAI:`${i}xai.svg`,GradientAI:`${i}gradientai.svg`,Triton:`${i}nvidia_triton.png`,Deepgram:`${i}deepgram.png`,ElevenLabs:`${i}elevenlabs.png`,"Fal AI":`${i}fal_ai.jpg`,"Voyage AI":`${i}voyage.webp`,"Jina AI":`${i}jina.png`,VolcEngine:`${i}volcengine.png`,DeepInfra:`${i}deepinfra.png`,"SAP Generative AI Hub":`${i}sap.png`};e.s(["Providers",()=>a,"getPlaceholder",0,e=>{if("AI/ML API"===e)return"aiml/flux-pro/v1.1";if("Vertex AI (Anthropic, Gemini, etc.)"===e)return"gemini-pro";if("Anthropic"==e)return"claude-3-opus";if("Amazon Bedrock"==e)return"claude-3-opus";if("AWS SageMaker"==e)return"sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b";else if("Google AI Studio"==e)return"gemini-pro";else if("Azure AI Foundry (Studio)"==e)return"azure_ai/command-r-plus";else if("Azure"==e)return"my-deployment";else if("Oracle Cloud Infrastructure (OCI)"==e)return"oci/xai.grok-4";else if("Snowflake"==e)return"snowflake/mistral-7b";else if("Voyage AI"==e)return"voyage/";else if("Jina AI"==e)return"jina_ai/";else if("VolcEngine"==e)return"volcengine/<any-model-on-volcengine>";else if("DeepInfra"==e)return"deepinfra/<any-model-on-deepinfra>";else if("Fal AI"==e)return"fal_ai/fal-ai/flux-pro/v1.1-ultra";else if("RunwayML"==e)return"runwayml/gen4_turbo";else if("Watsonx"===e)return"watsonx/ibm/granite-3-3-8b-instruct";else return"gpt-3.5-turbo"},"getProviderLogoAndName",0,e=>{if(!e)return{logo:"",displayName:"-"};if("gemini"===e.toLowerCase()){let e="Google AI Studio";return{logo:o[e],displayName:e}}let t=Object.keys(r).find(t=>r[t].toLowerCase()===e.toLowerCase());if(!t)return{logo:"",displayName:e};let i=a[t];return{logo:o[i],displayName:i}},"getProviderModels",0,(e,t)=>{console.log(`Provider key: ${e}`);let a=r[e];console.log(`Provider mapped to: ${a}`);let i=[];return e&&"object"==typeof t&&(Object.entries(t).forEach(([e,t])=>{if(null!==t&&"object"==typeof t&&"litellm_provider"in t){let r=t.litellm_provider;(r===a||"string"==typeof r&&r.includes(a))&&i.push(e)}}),"Cohere"==e&&(console.log("Adding cohere chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"cohere_chat"===t.litellm_provider&&i.push(e)})),"AWS SageMaker"==e&&(console.log("Adding sagemaker chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"sagemaker_chat"===t.litellm_provider&&i.push(e)}))),i},"providerLogoMap",0,o,"provider_map",0,r])},434626,e=>{"use strict";var t=e.i(271645);let a=t.forwardRef(function(e,a){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:a},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"}))});e.s(["ExternalLinkIcon",0,a],434626)},100486,e=>{"use strict";e.i(247167);var t=e.i(931067),a=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M899.6 276.5L705 396.4 518.4 147.5a8.06 8.06 0 00-12.9 0L319 396.4 124.3 276.5c-5.7-3.5-13.1 1.2-12.2 7.9L188.5 865c1.1 7.9 7.9 14 16 14h615.1c8 0 14.9-6 15.9-14l76.4-580.6c.8-6.7-6.5-11.4-12.3-7.9zm-126 534.1H250.3l-53.8-409.4 139.8 86.1L512 252.9l175.7 234.4 139.8-86.1-53.9 409.4zM512 509c-62.1 0-112.6 50.5-112.6 112.6S449.9 734.2 512 734.2s112.6-50.5 112.6-112.6S574.1 509 512 509zm0 160.9c-26.6 0-48.2-21.6-48.2-48.3 0-26.6 21.6-48.3 48.2-48.3s48.2 21.6 48.2 48.3c0 26.6-21.6 48.3-48.2 48.3z"}}]},name:"crown",theme:"outlined"};var i=e.i(9583),o=a.forwardRef(function(e,o){return a.createElement(i.default,(0,t.default)({},e,{ref:o,icon:r}))});e.s(["CrownOutlined",0,o],100486)}]);