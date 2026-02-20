(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,771674,e=>{"use strict";e.i(247167);var t=e.i(931067),s=e.i(271645);let a={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"}}]},name:"user",theme:"outlined"};var r=e.i(9583),i=s.forwardRef(function(e,i){return s.createElement(r.default,(0,t.default)({},e,{ref:i,icon:a}))});e.s(["UserOutlined",0,i],771674)},602073,e=>{"use strict";e.i(247167);var t=e.i(931067),s=e.i(271645);let a={icon:{tag:"svg",attrs:{viewBox:"0 0 1024 1024",focusable:"false"},children:[{tag:"path",attrs:{d:"M512 64L128 192v384c0 212.1 171.9 384 384 384s384-171.9 384-384V192L512 64zm312 512c0 172.3-139.7 312-312 312S200 748.3 200 576V246l312-110 312 110v330z"}},{tag:"path",attrs:{d:"M378.4 475.1a35.91 35.91 0 00-50.9 0 35.91 35.91 0 000 50.9l129.4 129.4 2.1 2.1a33.98 33.98 0 0048.1 0L730.6 434a33.98 33.98 0 000-48.1l-2.8-2.8a33.98 33.98 0 00-48.1 0L483 579.7 378.4 475.1z"}}]},name:"safety",theme:"outlined"};var r=e.i(9583),i=s.forwardRef(function(e,i){return s.createElement(r.default,(0,t.default)({},e,{ref:i,icon:a}))});e.s(["SafetyOutlined",0,i],602073)},818581,(e,t,s)=>{"use strict";Object.defineProperty(s,"__esModule",{value:!0}),Object.defineProperty(s,"useMergedRef",{enumerable:!0,get:function(){return r}});let a=e.r(271645);function r(e,t){let s=(0,a.useRef)(null),r=(0,a.useRef)(null);return(0,a.useCallback)(a=>{if(null===a){let e=s.current;e&&(s.current=null,e());let t=r.current;t&&(r.current=null,t())}else e&&(s.current=i(e,a)),t&&(r.current=i(t,a))},[e,t])}function i(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let s=e(t);return"function"==typeof s?s:()=>e(null)}}("function"==typeof s.default||"object"==typeof s.default&&null!==s.default)&&void 0===s.default.__esModule&&(Object.defineProperty(s.default,"__esModule",{value:!0}),Object.assign(s.default,s),t.exports=s.default)},62478,e=>{"use strict";var t=e.i(764205);let s=async e=>{if(!e)return null;try{return await (0,t.getProxyUISettings)(e)}catch(e){return console.error("Error fetching proxy settings:",e),null}};e.s(["fetchProxySettings",0,s])},190272,785913,e=>{"use strict";var t,s,a=((t={}).AUDIO_SPEECH="audio_speech",t.AUDIO_TRANSCRIPTION="audio_transcription",t.IMAGE_GENERATION="image_generation",t.VIDEO_GENERATION="video_generation",t.CHAT="chat",t.RESPONSES="responses",t.IMAGE_EDITS="image_edits",t.ANTHROPIC_MESSAGES="anthropic_messages",t.EMBEDDING="embedding",t),r=((s={}).IMAGE="image",s.VIDEO="video",s.CHAT="chat",s.RESPONSES="responses",s.IMAGE_EDITS="image_edits",s.ANTHROPIC_MESSAGES="anthropic_messages",s.EMBEDDINGS="embeddings",s.SPEECH="speech",s.TRANSCRIPTION="transcription",s.A2A_AGENTS="a2a_agents",s.MCP="mcp",s);let i={image_generation:"image",video_generation:"video",chat:"chat",responses:"responses",image_edits:"image_edits",anthropic_messages:"anthropic_messages",audio_speech:"speech",audio_transcription:"transcription",embedding:"embeddings"};e.s(["EndpointType",()=>r,"getEndpointType",0,e=>{if(console.log("getEndpointType:",e),Object.values(a).includes(e)){let t=i[e];return console.log("endpointType:",t),t}return"chat"}],785913),e.s(["generateCodeSnippet",0,e=>{let t,{apiKeySource:s,accessToken:a,apiKey:i,inputMessage:l,chatHistory:n,selectedTags:o,selectedVectorStores:c,selectedGuardrails:d,selectedPolicies:m,selectedMCPServers:p,mcpServers:u,mcpServerToolRestrictions:x,selectedVoice:g,endpointType:h,selectedModel:f,selectedSdk:_,proxySettings:b}=e,j="session"===s?a:i,y=window.location.origin,v=b?.LITELLM_UI_API_DOC_BASE_URL;v&&v.trim()?y=v:b?.PROXY_BASE_URL&&(y=b.PROXY_BASE_URL);let N=l||"Your prompt here",T=N.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n"),S=n.filter(e=>!e.isImage).map(({role:e,content:t})=>({role:e,content:t})),w={};o.length>0&&(w.tags=o),c.length>0&&(w.vector_stores=c),d.length>0&&(w.guardrails=d),m.length>0&&(w.policies=m);let A=f||"your-model-name",C="azure"===_?`import openai

client = openai.AzureOpenAI(
	api_key="${j||"YOUR_LITELLM_API_KEY"}",
	azure_endpoint="${y}",
	api_version="2024-02-01"
)`:`import openai

client = openai.OpenAI(
	api_key="${j||"YOUR_LITELLM_API_KEY"}",
	base_url="${y}"
)`;switch(h){case r.CHAT:{let e=Object.keys(w).length>0,s="";if(e){let e=JSON.stringify({metadata:w},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();s=`,
    extra_body=${e}`}let a=S.length>0?S:[{role:"user",content:N}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.chat.completions.create(
    model="${A}",
    messages=${JSON.stringify(a,null,4)}${s}
)

print(response)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.chat.completions.create(
#     model="${A}",
#     messages=[
#         {
#             "role": "user",
#             "content": [
#                 {
#                     "type": "text",
#                     "text": "${T}"
#                 },
#                 {
#                     "type": "image_url",
#                     "image_url": {
#                         "url": f"data:image/jpeg;base64,{base64_file}"  # or data:application/pdf;base64,{base64_file}
#                     }
#                 }
#             ]
#         }
#     ]${s}
# )
# print(response_with_file)
`;break}case r.RESPONSES:{let e=Object.keys(w).length>0,s="";if(e){let e=JSON.stringify({metadata:w},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();s=`,
    extra_body=${e}`}let a=S.length>0?S:[{role:"user",content:N}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.responses.create(
    model="${A}",
    input=${JSON.stringify(a,null,4)}${s}
)

print(response.output_text)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.responses.create(
#     model="${A}",
#     input=[
#         {
#             "role": "user",
#             "content": [
#                 {"type": "input_text", "text": "${T}"},
#                 {
#                     "type": "input_image",
#                     "image_url": f"data:image/jpeg;base64,{base64_file}",  # or data:application/pdf;base64,{base64_file}
#                 },
#             ],
#         }
#     ]${s}
# )
# print(response_with_file.output_text)
`;break}case r.IMAGE:t="azure"===_?`
# NOTE: The Azure SDK does not have a direct equivalent to the multi-modal 'responses.create' method shown for OpenAI.
# This snippet uses 'client.images.generate' and will create a new image based on your prompt.
# It does not use the uploaded image, as 'client.images.generate' does not support image inputs in this context.
import os
import requests
import json
import time
from PIL import Image

result = client.images.generate(
	model="${A}",
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
prompt = "${T}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${A}",
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
`;break;case r.IMAGE_EDITS:t="azure"===_?`
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
prompt = "${T}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${A}",
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
prompt = "${T}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${A}",
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
	model="${A}",
	encoding_format="base64" # or "float"
)

print(response.data[0].embedding)
`;break;case r.TRANSCRIPTION:t=`
# Open the audio file
audio_file = open("path/to/your/audio/file.mp3", "rb")

# Make the transcription request
response = client.audio.transcriptions.create(
	model="${A}",
	file=audio_file${l?`,
	prompt="${l.replace(/"/g,'\\"')}"`:""}
)

print(response.text)
`;break;case r.SPEECH:t=`
# Make the text-to-speech request
response = client.audio.speech.create(
	model="${A}",
	input="${l||"Your text to convert to speech here"}",
	voice="${g}"  # Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
)

# Save the audio to a file
output_filename = "output_speech.mp3"
response.stream_to_file(output_filename)
print(f"Audio saved to {output_filename}")

# Optional: Customize response format and speed
# response = client.audio.speech.create(
#     model="${A}",
#     input="${l||"Your text to convert to speech here"}",
#     voice="alloy",
#     response_format="mp3",  # Options: mp3, opus, aac, flac, wav, pcm
#     speed=1.0  # Range: 0.25 to 4.0
# )
# response.stream_to_file("output_speech.mp3")
`;break;default:t="\n# Code generation for this endpoint is not implemented yet."}return`${C}
${t}`}],190272)},976883,174886,879664,e=>{"use strict";var t=e.i(247167),s=e.i(843476),a=e.i(275144),r=e.i(434626),i=e.i(271645);let l=i.forwardRef(function(e,t){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:t},e),i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"}))});var n=e.i(994388),o=e.i(304967),c=e.i(599724),d=e.i(629569),m=e.i(212931),p=e.i(199133),u=e.i(653496),x=e.i(262218),g=e.i(592968),h=e.i(991124);e.s(["Copy",()=>h.default],174886);var h=h;let f=(0,e.i(475254).default)("info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);e.s(["default",()=>f],879664);var _=e.i(798496),b=e.i(727749),j=e.i(402874),y=e.i(764205),v=e.i(190272),N=e.i(785913),T=e.i(916925);let{TabPane:S}=u.Tabs,w=t.default.env.NEXT_PUBLIC_APP_NAME||"Ameritas LLM",A=`Ameritas has built a centralized AI Services Hub providing every team with consistent, secure, and scalable access to generative AI. A unified API abstracts multiple language models while automatically managing authentication, budget controls, rate limits, and observability — so developers focus on building features, not managing infrastructure.

Across the enterprise, the hub powers document summarization, customer-service automation, knowledge retrieval, and model experimentation. Teams onboard new models without modifying existing code, while governance teams maintain full visibility into usage and cost. This shared platform transforms AI into an enterprise-wide capability — accelerating innovation while preserving compliance and operational control.`;e.s(["default",0,({accessToken:e,isEmbedded:t=!1})=>{let C,k,E,M,I,P,O,[L,z]=(0,i.useState)(null),[R,D]=(0,i.useState)(null),[$,H]=(0,i.useState)(null),[U,F]=(0,i.useState)(`${w} Gateway`),[K,G]=(0,i.useState)(A),[B,q]=(0,i.useState)(""),[W,Y]=(0,i.useState)({}),[V,X]=(0,i.useState)(!0),[J,Q]=(0,i.useState)(!0),[Z,ee]=(0,i.useState)(!0),[et,es]=(0,i.useState)(""),[ea,er]=(0,i.useState)(""),[ei,el]=(0,i.useState)(""),[en,eo]=(0,i.useState)([]),[ec,ed]=(0,i.useState)([]),[em,ep]=(0,i.useState)([]),[eu,ex]=(0,i.useState)([]),[eg,eh]=(0,i.useState)([]),[ef,e_]=(0,i.useState)("I'm alive! ✓"),[eb,ej]=(0,i.useState)(!1),[ey,ev]=(0,i.useState)(!1),[eN,eT]=(0,i.useState)(!1),[eS,ew]=(0,i.useState)(null),[eA,eC]=(0,i.useState)(null),[ek,eE]=(0,i.useState)(null),[eM,eI]=(0,i.useState)({}),[eP,eO]=(0,i.useState)("models");(0,i.useEffect)(()=>{(async()=>{try{await (0,y.getUiConfig)()}catch(e){console.error("Failed to get UI config:",e)}let e=async()=>{try{X(!0);let e=await (0,y.modelHubPublicModelsCall)();console.log("ModelHubData:",e),z(e)}catch(e){console.error("There was an error fetching the public model data",e),e_("Service unavailable")}finally{X(!1)}},t=async()=>{try{Q(!0);let e=await (0,y.agentHubPublicModelsCall)();console.log("AgentHubData:",e),D(e)}catch(e){console.error("There was an error fetching the public agent data",e)}finally{Q(!1)}},s=async()=>{try{ee(!0);let e=await (0,y.mcpHubPublicServersCall)();console.log("MCPHubData:",e),H(e)}catch(e){console.error("There was an error fetching the public MCP server data",e)}finally{ee(!1)}};(async()=>{let e=await (0,y.getPublicModelHubInfo)();console.log("Public Model Hub Info:",e),F(e.docs_title),G(e.custom_docs_description||A),q(e.litellm_version),Y(e.useful_links||{})})(),e(),t(),s()})()},[]),(0,i.useEffect)(()=>{},[et,en,ec,em]);let eL=(0,i.useMemo)(()=>{if(!L||!Array.isArray(L))return[];let e=L;if(et.trim()){let t=et.toLowerCase(),s=t.split(/\s+/),a=L.filter(e=>{let a=e.model_group.toLowerCase();return!!a.includes(t)||s.every(e=>a.includes(e))});a.length>0&&(e=a.sort((e,s)=>{let a=e.model_group.toLowerCase(),r=s.model_group.toLowerCase(),i=1e3*(a===t),l=1e3*(r===t),n=100*!!a.startsWith(t),o=100*!!r.startsWith(t),c=50*!!t.split(/\s+/).every(e=>a.includes(e)),d=50*!!t.split(/\s+/).every(e=>r.includes(e)),m=a.length;return l+o+d+(1e3-r.length)-(i+n+c+(1e3-m))}))}return e.filter(e=>{let t=0===en.length||en.some(t=>e.providers?.includes(t)),s=0===ec.length||ec.includes(e.mode||""),a=0===em.length||Object.entries(e).filter(([e,t])=>e.startsWith("supports_")&&!0===t).some(([e])=>{let t=e.replace(/^supports_/,"").split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");return em.includes(t)});return t&&s&&a})},[L,et,en,ec,em]),ez=(0,i.useMemo)(()=>{if(!R||!Array.isArray(R))return[];let e=R;if(ea.trim()){let t=ea.toLowerCase(),s=t.split(/\s+/);e=(e=R.filter(e=>{let a=e.name.toLowerCase(),r=e.description.toLowerCase();return!!(a.includes(t)||r.includes(t))||s.every(e=>a.includes(e)||r.includes(e))})).sort((e,s)=>{let a=e.name.toLowerCase(),r=s.name.toLowerCase(),i=1e3*(a===t),l=1e3*(r===t),n=100*!!a.startsWith(t),o=100*!!r.startsWith(t),c=i+n+(1e3-a.length);return l+o+(1e3-r.length)-c})}return e.filter(e=>0===eu.length||e.skills?.some(e=>e.tags?.some(e=>eu.includes(e))))},[R,ea,eu]),eR=(0,i.useMemo)(()=>{if(!$||!Array.isArray($))return[];let e=$;if(ei.trim()){let t=ei.toLowerCase(),s=t.split(/\s+/);e=(e=$.filter(e=>{let a=e.server_name.toLowerCase(),r=(e.mcp_info?.description||"").toLowerCase();return!!(a.includes(t)||r.includes(t))||s.every(e=>a.includes(e)||r.includes(e))})).sort((e,s)=>{let a=e.server_name.toLowerCase(),r=s.server_name.toLowerCase(),i=1e3*(a===t),l=1e3*(r===t),n=100*!!a.startsWith(t),o=100*!!r.startsWith(t),c=i+n+(1e3-a.length);return l+o+(1e3-r.length)-c})}return e.filter(e=>0===eg.length||eg.includes(e.transport))},[$,ei,eg]),eD=e=>{navigator.clipboard.writeText(e),b.default.success("Copied to clipboard!")},e$=e=>e.replace(/^supports_/,"").split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" "),eH=e=>`$${(1e6*e).toFixed(4)}`,eU=e=>e?e>=1e3?`${(e/1e3).toFixed(0)}K`:e.toString():"N/A";return(0,s.jsx)(a.ThemeProvider,{accessToken:e,children:(0,s.jsxs)("div",{className:t?"w-full":"min-h-screen bg-white",children:[!t&&(0,s.jsx)(j.default,{userID:null,userEmail:null,userRole:null,premiumUser:!1,setProxySettings:eI,proxySettings:eM,accessToken:e||null,isPublicPage:!0,isDarkMode:!1,toggleDarkMode:()=>{}}),(0,s.jsxs)("div",{className:t?"w-full p-6":"w-full px-8 py-12",children:[t&&(0,s.jsx)("div",{className:"mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg",children:(0,s.jsx)("p",{className:"text-sm text-gray-700",children:"These are models, agents, and MCP servers your proxy admin has indicated are available in your company."})}),!t&&(0,s.jsxs)("div",{className:"mb-8 px-8 py-10",style:{background:"linear-gradient(135deg, #377dd0 0%, #0758ac 100%)",borderRadius:"4px"},children:[(0,s.jsx)("h1",{className:"text-white font-semibold mb-2",style:{fontSize:"40px",lineHeight:"54px",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:"AI Services Hub"}),(0,s.jsx)("p",{className:"text-white",style:{fontSize:"20px",lineHeight:"30px",opacity:.88,fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:"Enterprise-wide access to generative AI — secure, observable, and built to scale."})]}),!t&&(0,s.jsxs)("div",{className:"mb-8 bg-white p-8",style:{borderRadius:"4px",boxShadow:"0 3px 4px 1px rgba(0,0,0,.1)",borderLeft:"4px solid #377dd0"},children:[(0,s.jsx)("h2",{className:"font-semibold mb-5",style:{fontSize:"32px",lineHeight:"46px",color:"#363636",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:"About"}),(0,s.jsx)("p",{className:"mb-6 whitespace-pre-line",style:{fontSize:"16px",lineHeight:"24px",color:"#595959",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:K}),B&&(0,s.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,s.jsxs)("span",{className:"inline-flex items-center px-3 py-1 text-sm font-medium text-white",style:{backgroundColor:"#377dd0",borderRadius:"4px",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:["v",B]}),(0,s.jsxs)("span",{style:{fontSize:"14px",color:"#767676"},children:["Powered by ",w]})]})]}),W&&Object.keys(W).length>0&&(0,s.jsxs)("div",{className:"mb-8 bg-white p-8",style:{borderRadius:"4px",boxShadow:"0 3px 4px 1px rgba(0,0,0,.1)"},children:[(0,s.jsx)("h2",{className:"font-semibold mb-5",style:{fontSize:"32px",lineHeight:"46px",color:"#363636",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},children:"Useful Links"}),(0,s.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:Object.entries(W||{}).map(([e,t])=>({title:e,url:"string"==typeof t?t:t.url,index:"string"==typeof t?0:t.index??0})).sort((e,t)=>e.index-t.index).map(({title:e,url:t})=>(0,s.jsxs)("button",{onClick:()=>window.open(t,"_blank"),className:"flex items-center space-x-3 transition-colors p-3 border",style:{borderRadius:"4px",borderColor:"#cccccc",color:"#377dd0",fontFamily:"'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#f0f6fc"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="transparent"},children:[(0,s.jsx)(r.ExternalLinkIcon,{className:"w-4 h-4"}),(0,s.jsx)(c.Text,{className:"text-sm font-medium",children:e})]},e))})]}),!t&&(0,s.jsxs)(o.Card,{className:"mb-10 p-8 bg-white border border-gray-200 rounded-lg shadow-sm",children:[(0,s.jsx)(d.Title,{className:"text-2xl font-semibold mb-6 text-gray-900",children:"Health and Endpoint Status"}),(0,s.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:(0,s.jsxs)(c.Text,{className:"text-green-600 font-medium text-sm",children:["Service status: ",ef]})})]}),(0,s.jsx)(o.Card,{className:"p-8 bg-white border border-gray-200 rounded-lg shadow-sm",children:(0,s.jsxs)(u.Tabs,{activeKey:eP,onChange:eO,size:"large",className:"public-hub-tabs",children:[(0,s.jsxs)(S,{tab:"Model Hub",children:[(0,s.jsx)("div",{className:"flex justify-between items-center mb-8",children:(0,s.jsx)(d.Title,{className:"text-2xl font-semibold text-gray-900",children:"Available Models"})}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-center space-x-2 mb-3",children:[(0,s.jsx)(c.Text,{className:"text-sm font-medium text-gray-700",children:"Search Models:"}),(0,s.jsx)(g.Tooltip,{title:"Smart search with relevance ranking - finds models containing your search terms, ranked by relevance. Try searching 'xai grok-4', 'claude-4', 'gpt-4', or 'sonnet'",placement:"top",children:(0,s.jsx)(f,{className:"w-4 h-4 text-gray-400 cursor-help"})})]}),(0,s.jsxs)("div",{className:"relative",children:[(0,s.jsx)(l,{className:"w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"}),(0,s.jsx)("input",{type:"text",placeholder:"Search model names... (smart search enabled)",value:et,onChange:e=>es(e.target.value),className:"border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-sm font-medium mb-3 text-gray-700",children:"Provider:"}),(0,s.jsx)(p.Select,{mode:"multiple",value:en,onChange:e=>eo(e),placeholder:"Select providers",className:"w-full",size:"large",allowClear:!0,optionRender:e=>{let{logo:t}=(0,T.getProviderLogoAndName)(e.value);return(0,s.jsxs)("div",{className:"flex items-center space-x-2",children:[t&&(0,s.jsx)("img",{src:t,alt:e.label,className:"w-5 h-5 flex-shrink-0 object-contain",onError:e=>{e.target.style.display="none"}}),(0,s.jsx)("span",{className:"capitalize",children:e.label})]})},children:L&&Array.isArray(L)&&(C=new Set,L.forEach(e=>{e.providers.forEach(e=>C.add(e))}),Array.from(C)).map(e=>(0,s.jsx)(p.Select.Option,{value:e,children:e},e))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-sm font-medium mb-3 text-gray-700",children:"Mode:"}),(0,s.jsx)(p.Select,{mode:"multiple",value:ec,onChange:e=>ed(e),placeholder:"Select modes",className:"w-full",size:"large",allowClear:!0,children:L&&Array.isArray(L)&&(k=new Set,L.forEach(e=>{e.mode&&k.add(e.mode)}),Array.from(k)).map(e=>(0,s.jsx)(p.Select.Option,{value:e,children:e},e))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-sm font-medium mb-3 text-gray-700",children:"Features:"}),(0,s.jsx)(p.Select,{mode:"multiple",value:em,onChange:e=>ep(e),placeholder:"Select features",className:"w-full",size:"large",allowClear:!0,children:L&&Array.isArray(L)&&(E=new Set,L.forEach(e=>{Object.entries(e).filter(([e,t])=>e.startsWith("supports_")&&!0===t).forEach(([e])=>{let t=e.replace(/^supports_/,"").split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");E.add(t)})}),Array.from(E).sort()).map(e=>(0,s.jsx)(p.Select.Option,{value:e,children:e},e))})]})]}),(0,s.jsx)(_.ModelDataTable,{columns:[{header:"Model Name",accessorKey:"model_group",enableSorting:!0,cell:({row:e})=>(0,s.jsx)("div",{className:"overflow-hidden",children:(0,s.jsx)(g.Tooltip,{title:e.original.model_group,children:(0,s.jsx)(n.Button,{size:"xs",variant:"light",className:"font-mono text-blue-500 bg-blue-50 hover:bg-blue-100 text-xs font-normal px-2 py-0.5 text-left",onClick:()=>{ew(e.original),ej(!0)},children:e.original.model_group})})}),size:150},{header:"Providers",accessorKey:"providers",enableSorting:!0,cell:({row:e})=>{let t=e.original.providers;return(0,s.jsx)("div",{className:"flex flex-wrap gap-1",children:t.map(e=>{let{logo:t}=(0,T.getProviderLogoAndName)(e);return(0,s.jsxs)("div",{className:"flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs",children:[t&&(0,s.jsx)("img",{src:t,alt:e,className:"w-3 h-3 flex-shrink-0 object-contain",onError:e=>{e.target.style.display="none"}}),(0,s.jsx)("span",{className:"capitalize",children:e})]},e)})})},size:120},{header:"Mode",accessorKey:"mode",enableSorting:!0,cell:({row:e})=>{let t=e.original.mode;return(0,s.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,s.jsx)("span",{children:(e=>{switch(e?.toLowerCase()){case"chat":return"💬";case"rerank":return"🔄";case"embedding":return"📄";default:return"🤖"}})(t||"")}),(0,s.jsx)(c.Text,{children:t||"Chat"})]})},size:100},{header:"Max Input",accessorKey:"max_input_tokens",enableSorting:!0,cell:({row:e})=>(0,s.jsx)(c.Text,{className:"text-center",children:eU(e.original.max_input_tokens)}),size:100,meta:{className:"text-center"}},{header:"Max Output",accessorKey:"max_output_tokens",enableSorting:!0,cell:({row:e})=>(0,s.jsx)(c.Text,{className:"text-center",children:eU(e.original.max_output_tokens)}),size:100,meta:{className:"text-center"}},{header:"Input $/1M",accessorKey:"input_cost_per_token",enableSorting:!0,cell:({row:e})=>{let t=e.original.input_cost_per_token;return(0,s.jsx)(c.Text,{className:"text-center",children:t?eH(t):"Free"})},size:100,meta:{className:"text-center"}},{header:"Output $/1M",accessorKey:"output_cost_per_token",enableSorting:!0,cell:({row:e})=>{let t=e.original.output_cost_per_token;return(0,s.jsx)(c.Text,{className:"text-center",children:t?eH(t):"Free"})},size:100,meta:{className:"text-center"}},{header:"Features",accessorKey:"supports_vision",enableSorting:!1,cell:({row:e})=>{let t=Object.entries(e.original).filter(([e,t])=>e.startsWith("supports_")&&!0===t).map(([e])=>e$(e));return 0===t.length?(0,s.jsx)(c.Text,{className:"text-gray-400",children:"-"}):1===t.length?(0,s.jsx)("div",{className:"h-6 flex items-center",children:(0,s.jsx)(x.Tag,{color:"blue",className:"text-xs",children:t[0]})}):(0,s.jsxs)("div",{className:"h-6 flex items-center space-x-1",children:[(0,s.jsx)(x.Tag,{color:"blue",className:"text-xs",children:t[0]}),(0,s.jsx)(g.Tooltip,{title:(0,s.jsxs)("div",{className:"space-y-1",children:[(0,s.jsx)("div",{className:"font-medium",children:"All Features:"}),t.map((e,t)=>(0,s.jsxs)("div",{className:"text-xs",children:["• ",e]},t))]}),trigger:"click",placement:"topLeft",children:(0,s.jsxs)("span",{className:"text-xs text-blue-600 cursor-pointer hover:text-blue-800 hover:underline",onClick:e=>e.stopPropagation(),children:["+",t.length-1]})})]})},size:120},{header:"Health Status",accessorKey:"health_status",enableSorting:!0,cell:({row:e})=>{let t=e.original,a="healthy"===t.health_status?"green":"unhealthy"===t.health_status?"red":"default",r=t.health_response_time?`Response Time: ${Number(t.health_response_time).toFixed(2)}ms`:"N/A",i=t.health_checked_at?`Last Checked: ${new Date(t.health_checked_at).toLocaleString()}`:"N/A";return(0,s.jsx)(g.Tooltip,{title:(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("div",{children:r}),(0,s.jsx)("div",{children:i})]}),children:(0,s.jsx)(x.Tag,{color:a,children:(0,s.jsx)("span",{className:"capitalize",children:t.health_status??"Unknown"})},t.model_group)})},size:100},{header:"Limits",accessorKey:"rpm",enableSorting:!0,cell:({row:e})=>{var t,a;let r,i=e.original;return(0,s.jsx)(c.Text,{className:"text-xs text-gray-600",children:(t=i.rpm,a=i.tpm,r=[],t&&r.push(`RPM: ${t.toLocaleString()}`),a&&r.push(`TPM: ${a.toLocaleString()}`),r.length>0?r.join(", "):"N/A")})},size:150}],data:eL,isLoading:V,defaultSorting:[{id:"model_group",desc:!1}]}),(0,s.jsx)("div",{className:"mt-8 text-center",children:(0,s.jsxs)(c.Text,{className:"text-sm text-gray-600",children:["Showing ",eL.length," of ",L?.length||0," models"]})})]},"models"),R&&Array.isArray(R)&&R.length>0&&(0,s.jsxs)(S,{tab:"Agent Hub",children:[(0,s.jsx)("div",{className:"flex justify-between items-center mb-8",children:(0,s.jsx)(d.Title,{className:"text-2xl font-semibold text-gray-900",children:"Available Agents"})}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-center space-x-2 mb-3",children:[(0,s.jsx)(c.Text,{className:"text-sm font-medium text-gray-700",children:"Search Agents:"}),(0,s.jsx)(g.Tooltip,{title:"Search agents by name or description",placement:"top",children:(0,s.jsx)(f,{className:"w-4 h-4 text-gray-400 cursor-help"})})]}),(0,s.jsxs)("div",{className:"relative",children:[(0,s.jsx)(l,{className:"w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"}),(0,s.jsx)("input",{type:"text",placeholder:"Search agent names or descriptions...",value:ea,onChange:e=>er(e.target.value),className:"border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-sm font-medium mb-3 text-gray-700",children:"Skills:"}),(0,s.jsx)(p.Select,{mode:"multiple",value:eu,onChange:e=>ex(e),placeholder:"Select skills",className:"w-full",size:"large",allowClear:!0,children:R&&Array.isArray(R)&&(M=new Set,R.forEach(e=>{e.skills?.forEach(e=>{e.tags?.forEach(e=>M.add(e))})}),Array.from(M).sort()).map(e=>(0,s.jsx)(p.Select.Option,{value:e,children:e},e))})]})]}),(0,s.jsx)(_.ModelDataTable,{columns:[{header:"Agent Name",accessorKey:"name",enableSorting:!0,cell:({row:e})=>(0,s.jsx)("div",{className:"overflow-hidden",children:(0,s.jsx)(g.Tooltip,{title:e.original.name,children:(0,s.jsx)(n.Button,{size:"xs",variant:"light",className:"font-mono text-blue-500 bg-blue-50 hover:bg-blue-100 text-xs font-normal px-2 py-0.5 text-left",onClick:()=>{eC(e.original),ev(!0)},children:e.original.name})})}),size:150},{header:"Description",accessorKey:"description",enableSorting:!1,cell:({row:e})=>{let t=e.original.description,a=t.length>80?t.substring(0,80)+"...":t;return(0,s.jsx)(g.Tooltip,{title:t,children:(0,s.jsx)(c.Text,{className:"text-sm text-gray-700",children:a})})},size:250},{header:"Version",accessorKey:"version",enableSorting:!0,cell:({row:e})=>(0,s.jsx)(c.Text,{className:"text-sm",children:e.original.version}),size:80},{header:"Provider",accessorKey:"provider",enableSorting:!1,cell:({row:e})=>{let t=e.original.provider;return t?(0,s.jsx)("div",{className:"text-sm",children:(0,s.jsx)(c.Text,{className:"font-medium",children:t.organization})}):(0,s.jsx)(c.Text,{className:"text-gray-400",children:"-"})},size:120},{header:"Skills",accessorKey:"skills",enableSorting:!1,cell:({row:e})=>{let t=e.original.skills||[];return 0===t.length?(0,s.jsx)(c.Text,{className:"text-gray-400",children:"-"}):1===t.length?(0,s.jsx)("div",{className:"h-6 flex items-center",children:(0,s.jsx)(x.Tag,{color:"purple",className:"text-xs",children:t[0].name})}):(0,s.jsxs)("div",{className:"h-6 flex items-center space-x-1",children:[(0,s.jsx)(x.Tag,{color:"purple",className:"text-xs",children:t[0].name}),(0,s.jsx)(g.Tooltip,{title:(0,s.jsxs)("div",{className:"space-y-1",children:[(0,s.jsx)("div",{className:"font-medium",children:"All Skills:"}),t.map((e,t)=>(0,s.jsxs)("div",{className:"text-xs",children:["• ",e.name]},t))]}),trigger:"click",placement:"topLeft",children:(0,s.jsxs)("span",{className:"text-xs text-purple-600 cursor-pointer hover:text-purple-800 hover:underline",onClick:e=>e.stopPropagation(),children:["+",t.length-1]})})]})},size:150},{header:"Capabilities",accessorKey:"capabilities",enableSorting:!1,cell:({row:e})=>{let t=Object.entries(e.original.capabilities||{}).filter(([e,t])=>!0===t).map(([e])=>e);return 0===t.length?(0,s.jsx)(c.Text,{className:"text-gray-400",children:"-"}):(0,s.jsx)("div",{className:"flex flex-wrap gap-1",children:t.map(e=>(0,s.jsx)(x.Tag,{color:"green",className:"text-xs capitalize",children:e},e))})},size:150}],data:ez,isLoading:J,defaultSorting:[{id:"name",desc:!1}]}),(0,s.jsx)("div",{className:"mt-8 text-center",children:(0,s.jsxs)(c.Text,{className:"text-sm text-gray-600",children:["Showing ",ez.length," of ",R?.length||0," agents"]})})]},"agents"),$&&Array.isArray($)&&$.length>0&&(0,s.jsxs)(S,{tab:"MCP Hub",children:[(0,s.jsx)("div",{className:"flex justify-between items-center mb-8",children:(0,s.jsx)(d.Title,{className:"text-2xl font-semibold text-gray-900",children:"Available MCP Servers"})}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-center space-x-2 mb-3",children:[(0,s.jsx)(c.Text,{className:"text-sm font-medium text-gray-700",children:"Search MCP Servers:"}),(0,s.jsx)(g.Tooltip,{title:"Search MCP servers by name or description",placement:"top",children:(0,s.jsx)(f,{className:"w-4 h-4 text-gray-400 cursor-help"})})]}),(0,s.jsxs)("div",{className:"relative",children:[(0,s.jsx)(l,{className:"w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"}),(0,s.jsx)("input",{type:"text",placeholder:"Search MCP server names or descriptions...",value:ei,onChange:e=>el(e.target.value),className:"border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-sm font-medium mb-3 text-gray-700",children:"Transport:"}),(0,s.jsx)(p.Select,{mode:"multiple",value:eg,onChange:e=>eh(e),placeholder:"Select transport types",className:"w-full",size:"large",allowClear:!0,children:$&&Array.isArray($)&&(I=new Set,$.forEach(e=>{e.transport&&I.add(e.transport)}),Array.from(I).sort()).map(e=>(0,s.jsx)(p.Select.Option,{value:e,children:e},e))})]})]}),(0,s.jsx)(_.ModelDataTable,{columns:[{header:"Server Name",accessorKey:"server_name",enableSorting:!0,cell:({row:e})=>(0,s.jsx)("div",{className:"overflow-hidden",children:(0,s.jsx)(g.Tooltip,{title:e.original.server_name,children:(0,s.jsx)(n.Button,{size:"xs",variant:"light",className:"font-mono text-blue-500 bg-blue-50 hover:bg-blue-100 text-xs font-normal px-2 py-0.5 text-left",onClick:()=>{eE(e.original),eT(!0)},children:e.original.server_name})})}),size:150},{header:"Description",accessorKey:"mcp_info.description",enableSorting:!1,cell:({row:e})=>{let t=e.original.mcp_info?.description||"-",a=t.length>80?t.substring(0,80)+"...":t;return(0,s.jsx)(g.Tooltip,{title:t,children:(0,s.jsx)(c.Text,{className:"text-sm text-gray-700",children:a})})},size:250},{header:"URL",accessorKey:"url",enableSorting:!1,cell:({row:e})=>{let t=e.original.url,a=t.length>40?t.substring(0,40)+"...":t;return(0,s.jsx)(g.Tooltip,{title:t,children:(0,s.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,s.jsx)(c.Text,{className:"text-xs font-mono",children:a}),(0,s.jsx)(h.default,{onClick:()=>eD(t),className:"cursor-pointer text-gray-500 hover:text-blue-500 w-3 h-3"})]})})},size:200},{header:"Transport",accessorKey:"transport",enableSorting:!0,cell:({row:e})=>{let t=e.original.transport;return(0,s.jsx)(x.Tag,{color:"blue",className:"text-xs uppercase",children:t})},size:100},{header:"Auth Type",accessorKey:"auth_type",enableSorting:!0,cell:({row:e})=>{let t=e.original.auth_type;return(0,s.jsx)(x.Tag,{color:"none"===t?"gray":"green",className:"text-xs capitalize",children:t})},size:100}],data:eR,isLoading:Z,defaultSorting:[{id:"server_name",desc:!1}]}),(0,s.jsx)("div",{className:"mt-8 text-center",children:(0,s.jsxs)(c.Text,{className:"text-sm text-gray-600",children:["Showing ",eR.length," of ",$?.length||0," MCP servers"]})})]},"mcp")]})})]}),(0,s.jsx)(m.Modal,{title:(0,s.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,s.jsx)("span",{children:eS?.model_group||"Model Details"}),eS&&(0,s.jsx)(g.Tooltip,{title:"Copy model name",children:(0,s.jsx)(h.default,{onClick:()=>eD(eS.model_group),className:"cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"})})]}),width:1e3,open:eb,footer:null,onOk:()=>{ej(!1),ew(null)},onCancel:()=>{ej(!1),ew(null)},children:eS&&(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Model Overview"}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Model Name:"}),(0,s.jsx)(c.Text,{children:eS.model_group})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Mode:"}),(0,s.jsx)(c.Text,{children:eS.mode||"Not specified"})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Providers:"}),(0,s.jsx)("div",{className:"flex flex-wrap gap-1 mt-1",children:eS.providers.map(e=>{let{logo:t}=(0,T.getProviderLogoAndName)(e);return(0,s.jsx)(x.Tag,{color:"blue",children:(0,s.jsxs)("div",{className:"flex items-center space-x-1",children:[t&&(0,s.jsx)("img",{src:t,alt:e,className:"w-3 h-3 flex-shrink-0 object-contain",onError:e=>{e.target.style.display="none"}}),(0,s.jsx)("span",{className:"capitalize",children:e})]})},e)})})]})]}),eS.model_group.includes("*")&&(0,s.jsx)("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4",children:(0,s.jsxs)("div",{className:"flex items-start space-x-2",children:[(0,s.jsx)(f,{className:"w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium text-blue-900 mb-2",children:"Wildcard Routing"}),(0,s.jsxs)(c.Text,{className:"text-sm text-blue-800 mb-2",children:["This model uses wildcard routing. You can pass any value where you see the"," ",(0,s.jsx)("code",{className:"bg-blue-100 px-1 py-0.5 rounded text-xs",children:"*"})," symbol."]}),(0,s.jsxs)(c.Text,{className:"text-sm text-blue-800",children:["For example, with"," ",(0,s.jsx)("code",{className:"bg-blue-100 px-1 py-0.5 rounded text-xs",children:eS.model_group}),", you can use any string (",(0,s.jsx)("code",{className:"bg-blue-100 px-1 py-0.5 rounded text-xs",children:eS.model_group.replace("*","my-custom-value")}),") that matches this pattern."]})]})]})})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Token & Cost Information"}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Max Input Tokens:"}),(0,s.jsx)(c.Text,{children:eS.max_input_tokens?.toLocaleString()||"Not specified"})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Max Output Tokens:"}),(0,s.jsx)(c.Text,{children:eS.max_output_tokens?.toLocaleString()||"Not specified"})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Input Cost per 1M Tokens:"}),(0,s.jsx)(c.Text,{children:eS.input_cost_per_token?eH(eS.input_cost_per_token):"Not specified"})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Output Cost per 1M Tokens:"}),(0,s.jsx)(c.Text,{children:eS.output_cost_per_token?eH(eS.output_cost_per_token):"Not specified"})]})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Capabilities"}),(0,s.jsx)("div",{className:"flex flex-wrap gap-2",children:(P=Object.entries(eS).filter(([e,t])=>e.startsWith("supports_")&&!0===t).map(([e])=>e),O=["green","blue","purple","orange","red","yellow"],0===P.length?(0,s.jsx)(c.Text,{className:"text-gray-500",children:"No special capabilities listed"}):P.map((e,t)=>(0,s.jsx)(x.Tag,{color:O[t%O.length],children:e$(e)},e)))})]}),(eS.tpm||eS.rpm)&&(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Rate Limits"}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[eS.tpm&&(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Tokens per Minute:"}),(0,s.jsx)(c.Text,{children:eS.tpm.toLocaleString()})]}),eS.rpm&&(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Requests per Minute:"}),(0,s.jsx)(c.Text,{children:eS.rpm.toLocaleString()})]})]})]}),eS.supported_openai_params&&(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Supported OpenAI Parameters"}),(0,s.jsx)("div",{className:"flex flex-wrap gap-2",children:eS.supported_openai_params.map(e=>(0,s.jsx)(x.Tag,{color:"green",children:e},e))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Usage Example"}),(0,s.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,s.jsx)("pre",{className:"text-sm",children:(0,v.generateCodeSnippet)({apiKeySource:"custom",accessToken:null,apiKey:"your_api_key",inputMessage:"Hello, how are you?",chatHistory:[{role:"user",content:"Hello, how are you?",isImage:!1}],selectedTags:[],selectedVectorStores:[],selectedGuardrails:[],selectedPolicies:[],selectedMCPServers:[],endpointType:(0,N.getEndpointType)(eS.mode||"chat"),selectedModel:eS.model_group,selectedSdk:"openai"})})}),(0,s.jsx)("div",{className:"mt-2 text-right",children:(0,s.jsx)("button",{onClick:()=>{eD((0,v.generateCodeSnippet)({apiKeySource:"custom",accessToken:null,apiKey:"your_api_key",inputMessage:"Hello, how are you?",chatHistory:[{role:"user",content:"Hello, how are you?",isImage:!1}],selectedTags:[],selectedVectorStores:[],selectedGuardrails:[],selectedPolicies:[],selectedMCPServers:[],endpointType:(0,N.getEndpointType)(eS.mode||"chat"),selectedModel:eS.model_group,selectedSdk:"openai"}))},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:"Copy to clipboard"})})]})]})}),(0,s.jsx)(m.Modal,{title:(0,s.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,s.jsx)("span",{children:eA?.name||"Agent Details"}),eA&&(0,s.jsx)(g.Tooltip,{title:"Copy agent name",children:(0,s.jsx)(h.default,{onClick:()=>eD(eA.name),className:"cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"})})]}),width:1e3,open:ey,footer:null,onOk:()=>{ev(!1),eC(null)},onCancel:()=>{ev(!1),eC(null)},children:eA&&(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Agent Overview"}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Name:"}),(0,s.jsx)(c.Text,{children:eA.name})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Version:"}),(0,s.jsx)(c.Text,{children:eA.version})]}),(0,s.jsxs)("div",{className:"col-span-2",children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Description:"}),(0,s.jsx)(c.Text,{children:eA.description})]}),eA.url&&(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"URL:"}),(0,s.jsx)("a",{href:eA.url,target:"_blank",rel:"noopener noreferrer",className:"text-blue-600 hover:text-blue-800 text-sm break-all",children:eA.url})]})]})]}),eA.capabilities&&(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Capabilities"}),(0,s.jsx)("div",{className:"flex flex-wrap gap-2",children:Object.entries(eA.capabilities).filter(([e,t])=>!0===t).map(([e])=>(0,s.jsx)(x.Tag,{color:"green",className:"capitalize",children:e},e))})]}),eA.skills&&eA.skills.length>0&&(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Skills"}),(0,s.jsx)("div",{className:"space-y-4",children:eA.skills.map((e,t)=>(0,s.jsxs)("div",{className:"border border-gray-200 rounded-lg p-4",children:[(0,s.jsx)("div",{className:"flex items-start justify-between mb-2",children:(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium text-base",children:e.name}),(0,s.jsx)(c.Text,{className:"text-sm text-gray-600",children:e.description})]})}),e.tags&&e.tags.length>0&&(0,s.jsx)("div",{className:"flex flex-wrap gap-1 mt-2",children:e.tags.map(e=>(0,s.jsx)(x.Tag,{color:"purple",className:"text-xs",children:e},e))})]},t))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Input/Output Modes"}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Input Modes:"}),(0,s.jsx)("div",{className:"flex flex-wrap gap-1 mt-1",children:eA.defaultInputModes?.map(e=>(0,s.jsx)(x.Tag,{color:"blue",children:e},e))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Output Modes:"}),(0,s.jsx)("div",{className:"flex flex-wrap gap-1 mt-1",children:eA.defaultOutputModes?.map(e=>(0,s.jsx)(x.Tag,{color:"blue",children:e},e))})]})]})]}),eA.documentationUrl&&(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Documentation"}),(0,s.jsxs)("a",{href:eA.documentationUrl,target:"_blank",rel:"noopener noreferrer",className:"text-blue-600 hover:text-blue-800 flex items-center space-x-2",children:[(0,s.jsx)(r.ExternalLinkIcon,{className:"w-4 h-4"}),(0,s.jsx)("span",{children:"View Documentation"})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Usage Example (A2A Protocol)"}),(0,s.jsxs)("div",{className:"mb-4",children:[(0,s.jsx)(c.Text,{className:"text-sm font-medium mb-2 text-gray-700",children:"Step 1: Retrieve Agent Card"}),(0,s.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,s.jsx)("pre",{className:"text-xs",children:`base_url = '${eA.url}'

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
        )`})}),(0,s.jsx)("div",{className:"mt-2 text-right",children:(0,s.jsx)("button",{onClick:()=>{eD(`from a2a.client import A2ACardResolver, A2AClient
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

base_url = '${eA.url}'

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
        )`)},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:"Copy to clipboard"})})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-sm font-medium mb-2 text-gray-700",children:"Step 2: Call the Agent"}),(0,s.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,s.jsx)("pre",{className:"text-xs",children:`client = A2AClient(
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
print(response.model_dump(mode='json', exclude_none=True))`})}),(0,s.jsx)("div",{className:"mt-2 text-right",children:(0,s.jsx)("button",{onClick:()=>{eD(`client = A2AClient(
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
print(response.model_dump(mode='json', exclude_none=True))`)},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:"Copy to clipboard"})})]})]})]})}),(0,s.jsx)(m.Modal,{title:(0,s.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,s.jsx)("span",{children:ek?.server_name||"MCP Server Details"}),ek&&(0,s.jsx)(g.Tooltip,{title:"Copy server name",children:(0,s.jsx)(h.default,{onClick:()=>eD(ek.server_name),className:"cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"})})]}),width:1e3,open:eN,footer:null,onOk:()=>{eT(!1),eE(null)},onCancel:()=>{eT(!1),eE(null)},children:ek&&(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Server Overview"}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Server Name:"}),(0,s.jsx)(c.Text,{children:ek.server_name})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Transport:"}),(0,s.jsx)(x.Tag,{color:"blue",children:ek.transport})]}),ek.alias&&(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Alias:"}),(0,s.jsx)(c.Text,{children:ek.alias})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Auth Type:"}),(0,s.jsx)(x.Tag,{color:"none"===ek.auth_type?"gray":"green",children:ek.auth_type})]}),(0,s.jsxs)("div",{className:"col-span-2",children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"Description:"}),(0,s.jsx)(c.Text,{children:ek.mcp_info?.description||"-"})]}),(0,s.jsxs)("div",{className:"col-span-2",children:[(0,s.jsx)(c.Text,{className:"font-medium",children:"URL:"}),(0,s.jsxs)("a",{href:ek.url,target:"_blank",rel:"noopener noreferrer",className:"text-blue-600 hover:text-blue-800 text-sm break-all flex items-center space-x-2",children:[(0,s.jsx)("span",{children:ek.url}),(0,s.jsx)(r.ExternalLinkIcon,{className:"w-4 h-4"})]})]})]})]}),ek.mcp_info&&Object.keys(ek.mcp_info).length>0&&(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Additional Information"}),(0,s.jsx)("div",{className:"bg-gray-50 p-4 rounded-lg",children:(0,s.jsx)("pre",{className:"text-xs overflow-x-auto",children:JSON.stringify(ek.mcp_info,null,2)})})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(c.Text,{className:"text-lg font-semibold mb-4",children:"Usage Example"}),(0,s.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,s.jsx)("pre",{className:"text-sm",children:`# Using MCP Server with Python FastMCP

from fastmcp import Client
import asyncio

# Standard MCP configuration
config = {
    "mcpServers": {
        "${ek.server_name}": {
            "url": "http://localhost:4000/${ek.server_name}/mcp",
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
    asyncio.run(main())`})}),(0,s.jsx)("div",{className:"mt-2 text-right",children:(0,s.jsx)("button",{onClick:()=>{eD(`# Using MCP Server with Python FastMCP

from fastmcp import Client
import asyncio

# Standard MCP configuration
config = {
    "mcpServers": {
        "${ek.server_name}": {
            "url": "http://localhost:4000/${ek.server_name}/mcp",
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
    asyncio.run(main())`)},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:"Copy to clipboard"})})]})]})})]})})}],976883)}]);