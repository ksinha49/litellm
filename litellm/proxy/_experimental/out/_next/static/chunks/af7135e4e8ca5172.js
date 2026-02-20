(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,190272,785913,e=>{"use strict";var t,i,n=((t={}).AUDIO_SPEECH="audio_speech",t.AUDIO_TRANSCRIPTION="audio_transcription",t.IMAGE_GENERATION="image_generation",t.VIDEO_GENERATION="video_generation",t.CHAT="chat",t.RESPONSES="responses",t.IMAGE_EDITS="image_edits",t.ANTHROPIC_MESSAGES="anthropic_messages",t.EMBEDDING="embedding",t),o=((i={}).IMAGE="image",i.VIDEO="video",i.CHAT="chat",i.RESPONSES="responses",i.IMAGE_EDITS="image_edits",i.ANTHROPIC_MESSAGES="anthropic_messages",i.EMBEDDINGS="embeddings",i.SPEECH="speech",i.TRANSCRIPTION="transcription",i.A2A_AGENTS="a2a_agents",i.MCP="mcp",i);let a={image_generation:"image",video_generation:"video",chat:"chat",responses:"responses",image_edits:"image_edits",anthropic_messages:"anthropic_messages",audio_speech:"speech",audio_transcription:"transcription",embedding:"embeddings"};e.s(["EndpointType",()=>o,"getEndpointType",0,e=>{if(console.log("getEndpointType:",e),Object.values(n).includes(e)){let t=a[e];return console.log("endpointType:",t),t}return"chat"}],785913),e.s(["generateCodeSnippet",0,e=>{let t,{apiKeySource:i,accessToken:n,apiKey:a,inputMessage:r,chatHistory:l,selectedTags:s,selectedVectorStores:c,selectedGuardrails:d,selectedPolicies:p,selectedMCPServers:m,mcpServers:u,mcpServerToolRestrictions:g,selectedVoice:f,endpointType:h,selectedModel:$,selectedSdk:b,proxySettings:_}=e,S="session"===i?n:a,v=window.location.origin,y=_?.LITELLM_UI_API_DOC_BASE_URL;y&&y.trim()?v=y:_?.PROXY_BASE_URL&&(v=_.PROXY_BASE_URL);let I=r||"Your prompt here",w=I.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n"),C=l.filter(e=>!e.isImage).map(({role:e,content:t})=>({role:e,content:t})),x={};s.length>0&&(x.tags=s),c.length>0&&(x.vector_stores=c),d.length>0&&(x.guardrails=d),p.length>0&&(x.policies=p);let E=$||"your-model-name",T="azure"===b?`import openai

client = openai.AzureOpenAI(
	api_key="${S||"YOUR_LITELLM_API_KEY"}",
	azure_endpoint="${v}",
	api_version="2024-02-01"
)`:`import openai

client = openai.OpenAI(
	api_key="${S||"YOUR_LITELLM_API_KEY"}",
	base_url="${v}"
)`;switch(h){case o.CHAT:{let e=Object.keys(x).length>0,i="";if(e){let e=JSON.stringify({metadata:x},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();i=`,
    extra_body=${e}`}let n=C.length>0?C:[{role:"user",content:I}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.chat.completions.create(
    model="${E}",
    messages=${JSON.stringify(n,null,4)}${i}
)

print(response)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.chat.completions.create(
#     model="${E}",
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
#     ]${i}
# )
# print(response_with_file)
`;break}case o.RESPONSES:{let e=Object.keys(x).length>0,i="";if(e){let e=JSON.stringify({metadata:x},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();i=`,
    extra_body=${e}`}let n=C.length>0?C:[{role:"user",content:I}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.responses.create(
    model="${E}",
    input=${JSON.stringify(n,null,4)}${i}
)

print(response.output_text)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.responses.create(
#     model="${E}",
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
#     ]${i}
# )
# print(response_with_file.output_text)
`;break}case o.IMAGE:t="azure"===b?`
# NOTE: The Azure SDK does not have a direct equivalent to the multi-modal 'responses.create' method shown for OpenAI.
# This snippet uses 'client.images.generate' and will create a new image based on your prompt.
# It does not use the uploaded image, as 'client.images.generate' does not support image inputs in this context.
import os
import requests
import json
import time
from PIL import Image

result = client.images.generate(
	model="${E}",
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
prompt = "${w}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${E}",
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
`;break;case o.IMAGE_EDITS:t="azure"===b?`
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
	model="${E}",
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
	model="${E}",
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
`;break;case o.EMBEDDINGS:t=`
response = client.embeddings.create(
	input="${r||"Your string here"}",
	model="${E}",
	encoding_format="base64" # or "float"
)

print(response.data[0].embedding)
`;break;case o.TRANSCRIPTION:t=`
# Open the audio file
audio_file = open("path/to/your/audio/file.mp3", "rb")

# Make the transcription request
response = client.audio.transcriptions.create(
	model="${E}",
	file=audio_file${r?`,
	prompt="${r.replace(/"/g,'\\"')}"`:""}
)

print(response.text)
`;break;case o.SPEECH:t=`
# Make the text-to-speech request
response = client.audio.speech.create(
	model="${E}",
	input="${r||"Your text to convert to speech here"}",
	voice="${f}"  # Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
)

# Save the audio to a file
output_filename = "output_speech.mp3"
response.stream_to_file(output_filename)
print(f"Audio saved to {output_filename}")

# Optional: Customize response format and speed
# response = client.audio.speech.create(
#     model="${E}",
#     input="${r||"Your text to convert to speech here"}",
#     voice="alloy",
#     response_format="mp3",  # Options: mp3, opus, aac, flac, wav, pcm
#     speed=1.0  # Range: 0.25 to 4.0
# )
# response.stream_to_file("output_speech.mp3")
`;break;default:t="\n# Code generation for this endpoint is not implemented yet."}return`${T}
${t}`}],190272)},209261,e=>{"use strict";e.s(["extractCategories",0,e=>{let t=new Set;return e.forEach(e=>{e.category&&""!==e.category.trim()&&t.add(e.category)}),["All",...Array.from(t).sort(),"Other"]},"filterPluginsByCategory",0,(e,t)=>"All"===t?e:"Other"===t?e.filter(e=>!e.category||""===e.category.trim()):e.filter(e=>e.category===t),"filterPluginsBySearch",0,(e,t)=>{if(!t||""===t.trim())return e;let i=t.toLowerCase().trim();return e.filter(e=>{let t=e.name.toLowerCase().includes(i),n=e.description?.toLowerCase().includes(i)||!1,o=e.keywords?.some(e=>e.toLowerCase().includes(i))||!1;return t||n||o})},"formatDateString",0,e=>{if(!e)return"N/A";try{return new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}catch(e){return"Invalid date"}},"formatInstallCommand",0,e=>"github"===e.source.source&&e.source.repo?`/plugin marketplace add ${e.source.repo}`:"url"===e.source.source&&e.source.url?`/plugin marketplace add ${e.source.url}`:`/plugin marketplace add ${e.name}`,"getCategoryBadgeColor",0,e=>{if(!e)return"gray";let t=e.toLowerCase();if(t.includes("development")||t.includes("dev"))return"blue";if(t.includes("productivity")||t.includes("workflow"))return"green";if(t.includes("learning")||t.includes("education"))return"purple";if(t.includes("security")||t.includes("safety"))return"red";if(t.includes("data")||t.includes("analytics"))return"orange";else if(t.includes("integration")||t.includes("api"))return"yellow";return"gray"},"getSourceDisplayText",0,e=>"github"===e.source&&e.repo?`GitHub: ${e.repo}`:"url"===e.source&&e.url?e.url:"Unknown source","getSourceLink",0,e=>"github"===e.source&&e.repo?`https://github.com/${e.repo}`:"url"===e.source&&e.url?e.url:null,"isValidEmail",0,e=>!e||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),"isValidSemanticVersion",0,e=>!e||/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(e),"isValidUrl",0,e=>{if(!e)return!0;try{return new URL(e),!0}catch{return!1}},"parseKeywords",0,e=>e&&""!==e.trim()?e.split(",").map(e=>e.trim()).filter(e=>""!==e):[],"validatePluginName",0,e=>!!e&&""!==e.trim()&&/^[a-z0-9-]+$/.test(e)])},928685,e=>{"use strict";var t=e.i(38953);e.s(["SearchOutlined",()=>t.default])},280898,e=>{"use strict";e.i(247167);var t=e.i(271645),i=e.i(121229),n=e.i(864517),o=e.i(343794),a=e.i(931067),r=e.i(209428),l=e.i(211577),s=e.i(703923),c=e.i(404948),d=["className","prefixCls","style","active","status","iconPrefix","icon","wrapperStyle","stepNumber","disabled","description","title","subTitle","progressDot","stepIcon","tailContent","icons","stepIndex","onStepClick","onClick","render"];function p(e){return"string"==typeof e}let m=function(e){var i,n,m,u,g,f=e.className,h=e.prefixCls,$=e.style,b=e.active,_=e.status,S=e.iconPrefix,v=e.icon,y=(e.wrapperStyle,e.stepNumber),I=e.disabled,w=e.description,C=e.title,x=e.subTitle,E=e.progressDot,T=e.stepIcon,O=e.tailContent,k=e.icons,j=e.stepIndex,N=e.onStepClick,q=e.onClick,A=e.render,z=(0,s.default)(e,d),H={};N&&!I&&(H.role="button",H.tabIndex=0,H.onClick=function(e){null==q||q(e),N(j)},H.onKeyDown=function(e){var t=e.which;(t===c.default.ENTER||t===c.default.SPACE)&&N(j)});var D=_||"wait",P=(0,o.default)("".concat(h,"-item"),"".concat(h,"-item-").concat(D),f,(g={},(0,l.default)(g,"".concat(h,"-item-custom"),v),(0,l.default)(g,"".concat(h,"-item-active"),b),(0,l.default)(g,"".concat(h,"-item-disabled"),!0===I),g)),M=(0,r.default)({},$),B=t.createElement("div",(0,a.default)({},z,{className:P,style:M}),t.createElement("div",(0,a.default)({onClick:q},H,{className:"".concat(h,"-item-container")}),t.createElement("div",{className:"".concat(h,"-item-tail")},O),t.createElement("div",{className:"".concat(h,"-item-icon")},(m=(0,o.default)("".concat(h,"-icon"),"".concat(S,"icon"),(i={},(0,l.default)(i,"".concat(S,"icon-").concat(v),v&&p(v)),(0,l.default)(i,"".concat(S,"icon-check"),!v&&"finish"===_&&(k&&!k.finish||!k)),(0,l.default)(i,"".concat(S,"icon-cross"),!v&&"error"===_&&(k&&!k.error||!k)),i)),u=t.createElement("span",{className:"".concat(h,"-icon-dot")}),n=E?"function"==typeof E?t.createElement("span",{className:"".concat(h,"-icon")},E(u,{index:y-1,status:_,title:C,description:w})):t.createElement("span",{className:"".concat(h,"-icon")},u):v&&!p(v)?t.createElement("span",{className:"".concat(h,"-icon")},v):k&&k.finish&&"finish"===_?t.createElement("span",{className:"".concat(h,"-icon")},k.finish):k&&k.error&&"error"===_?t.createElement("span",{className:"".concat(h,"-icon")},k.error):v||"finish"===_||"error"===_?t.createElement("span",{className:m}):t.createElement("span",{className:"".concat(h,"-icon")},y),T&&(n=T({index:y-1,status:_,title:C,description:w,node:n})),n)),t.createElement("div",{className:"".concat(h,"-item-content")},t.createElement("div",{className:"".concat(h,"-item-title")},C,x&&t.createElement("div",{title:"string"==typeof x?x:void 0,className:"".concat(h,"-item-subtitle")},x)),w&&t.createElement("div",{className:"".concat(h,"-item-description")},w))));return A&&(B=A(B)||null),B};var u=["prefixCls","style","className","children","direction","type","labelPlacement","iconPrefix","status","size","current","progressDot","stepIcon","initial","icons","onChange","itemRender","items"];function g(e){var i,n=e.prefixCls,c=void 0===n?"rc-steps":n,d=e.style,p=void 0===d?{}:d,g=e.className,f=(e.children,e.direction),h=e.type,$=void 0===h?"default":h,b=e.labelPlacement,_=e.iconPrefix,S=void 0===_?"rc":_,v=e.status,y=void 0===v?"process":v,I=e.size,w=e.current,C=void 0===w?0:w,x=e.progressDot,E=e.stepIcon,T=e.initial,O=void 0===T?0:T,k=e.icons,j=e.onChange,N=e.itemRender,q=e.items,A=(0,s.default)(e,u),z="inline"===$,H=z||void 0!==x&&x,D=z||void 0===f?"horizontal":f,P=z?void 0:I,M=(0,o.default)(c,"".concat(c,"-").concat(D),g,(i={},(0,l.default)(i,"".concat(c,"-").concat(P),P),(0,l.default)(i,"".concat(c,"-label-").concat(H?"vertical":void 0===b?"horizontal":b),"horizontal"===D),(0,l.default)(i,"".concat(c,"-dot"),!!H),(0,l.default)(i,"".concat(c,"-navigation"),"navigation"===$),(0,l.default)(i,"".concat(c,"-inline"),z),i)),B=function(e){j&&C!==e&&j(e)};return t.default.createElement("div",(0,a.default)({className:M,style:p},A),(void 0===q?[]:q).filter(function(e){return e}).map(function(e,i){var n=(0,r.default)({},e),o=O+i;return"error"===y&&i===C-1&&(n.className="".concat(c,"-next-error")),n.status||(o===C?n.status=y:o<C?n.status="finish":n.status="wait"),z&&(n.icon=void 0,n.subTitle=void 0),!n.render&&N&&(n.render=function(e){return N(n,e)}),t.default.createElement(m,(0,a.default)({},n,{active:o===C,stepNumber:o+1,stepIndex:o,key:o,prefixCls:c,iconPrefix:S,wrapperStyle:p,progressDot:H,stepIcon:E,icons:k,onStepClick:j&&B}))}))}g.Step=m;var f=e.i(242064),h=e.i(517455),$=e.i(150073),b=e.i(309821),_=e.i(491816);e.i(296059);var S=e.i(915654),v=e.i(183293),y=e.i(246422),I=e.i(838378);let w=(e,t)=>{let i=`${t.componentCls}-item`,n=`${e}IconColor`,o=`${e}TitleColor`,a=`${e}DescriptionColor`,r=`${e}TailColor`,l=`${e}IconBgColor`,s=`${e}IconBorderColor`,c=`${e}DotColor`;return{[`${i}-${e} ${i}-icon`]:{backgroundColor:t[l],borderColor:t[s],[`> ${t.componentCls}-icon`]:{color:t[n],[`${t.componentCls}-icon-dot`]:{background:t[c]}}},[`${i}-${e}${i}-custom ${i}-icon`]:{[`> ${t.componentCls}-icon`]:{color:t[c]}},[`${i}-${e} > ${i}-container > ${i}-content > ${i}-title`]:{color:t[o],"&::after":{backgroundColor:t[r]}},[`${i}-${e} > ${i}-container > ${i}-content > ${i}-description`]:{color:t[a]},[`${i}-${e} > ${i}-container > ${i}-tail::after`]:{backgroundColor:t[r]}}},C=(0,y.genStyleHooks)("Steps",e=>{let{colorTextDisabled:t,controlHeightLG:i,colorTextLightSolid:n,colorText:o,colorPrimary:a,colorTextDescription:r,colorTextQuaternary:l,colorError:s,colorBorderSecondary:c,colorSplit:d}=e;return(e=>{let{componentCls:t}=e;return{[t]:Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},(0,v.resetComponent)(e)),{display:"flex",width:"100%",fontSize:0,textAlign:"initial"}),(e=>{let{componentCls:t,motionDurationSlow:i}=e,n=`${t}-item`,o=`${n}-icon`;return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({[n]:{position:"relative",display:"inline-block",flex:1,overflow:"hidden",verticalAlign:"top","&:last-child":{flex:"none",[`> ${n}-container > ${n}-tail, > ${n}-container >  ${n}-content > ${n}-title::after`]:{display:"none"}}},[`${n}-container`]:{outline:"none",[`&:focus-visible ${o}`]:(0,v.genFocusOutline)(e)},[`${o}, ${n}-content`]:{display:"inline-block",verticalAlign:"top"},[o]:{width:e.iconSize,height:e.iconSize,marginTop:0,marginBottom:0,marginInlineStart:0,marginInlineEnd:e.marginXS,fontSize:e.iconFontSize,fontFamily:e.fontFamily,lineHeight:(0,S.unit)(e.iconSize),textAlign:"center",borderRadius:e.iconSize,border:`${(0,S.unit)(e.lineWidth)} ${e.lineType} transparent`,transition:`background-color ${i}, border-color ${i}`,[`${t}-icon`]:{position:"relative",top:e.iconTop,color:e.colorPrimary,lineHeight:1}},[`${n}-tail`]:{position:"absolute",top:e.calc(e.iconSize).div(2).equal(),insetInlineStart:0,width:"100%","&::after":{display:"inline-block",width:"100%",height:e.lineWidth,background:e.colorSplit,borderRadius:e.lineWidth,transition:`background ${i}`,content:'""'}},[`${n}-title`]:{position:"relative",display:"inline-block",paddingInlineEnd:e.padding,color:e.colorText,fontSize:e.fontSizeLG,lineHeight:(0,S.unit)(e.titleLineHeight),"&::after":{position:"absolute",top:e.calc(e.titleLineHeight).div(2).equal(),insetInlineStart:"100%",display:"block",width:9999,height:e.lineWidth,background:e.processTailColor,content:'""'}},[`${n}-subtitle`]:{display:"inline",marginInlineStart:e.marginXS,color:e.colorTextDescription,fontWeight:"normal",fontSize:e.fontSize},[`${n}-description`]:{color:e.colorTextDescription,fontSize:e.fontSize}},w("wait",e)),w("process",e)),{[`${n}-process > ${n}-container > ${n}-title`]:{fontWeight:e.fontWeightStrong}}),w("finish",e)),w("error",e)),{[`${n}${t}-next-error > ${t}-item-title::after`]:{background:e.colorError},[`${n}-disabled`]:{cursor:"not-allowed"}})})(e)),(e=>{let{componentCls:t,motionDurationSlow:i}=e;return{[`& ${t}-item`]:{[`&:not(${t}-item-active)`]:{[`& > ${t}-item-container[role='button']`]:{cursor:"pointer",[`${t}-item`]:{[`&-title, &-subtitle, &-description, &-icon ${t}-icon`]:{transition:`color ${i}`}},"&:hover":{[`${t}-item`]:{"&-title, &-subtitle, &-description":{color:e.colorPrimary}}}},[`&:not(${t}-item-process)`]:{[`& > ${t}-item-container[role='button']:hover`]:{[`${t}-item`]:{"&-icon":{borderColor:e.colorPrimary,[`${t}-icon`]:{color:e.colorPrimary}}}}}}},[`&${t}-horizontal:not(${t}-label-vertical)`]:{[`${t}-item`]:{paddingInlineStart:e.padding,whiteSpace:"nowrap","&:first-child":{paddingInlineStart:0},[`&:last-child ${t}-item-title`]:{paddingInlineEnd:0},"&-tail":{display:"none"},"&-description":{maxWidth:e.descriptionMaxWidth,whiteSpace:"normal"}}}}})(e)),(e=>{let{componentCls:t,customIconTop:i,customIconSize:n,customIconFontSize:o}=e;return{[`${t}-item-custom`]:{[`> ${t}-item-container > ${t}-item-icon`]:{height:"auto",background:"none",border:0,[`> ${t}-icon`]:{top:i,width:n,height:n,fontSize:o,lineHeight:(0,S.unit)(n)}}},[`&:not(${t}-vertical)`]:{[`${t}-item-custom`]:{[`${t}-item-icon`]:{width:"auto",background:"none"}}}}})(e)),(e=>{let{componentCls:t,iconSizeSM:i,fontSizeSM:n,fontSize:o,colorTextDescription:a}=e;return{[`&${t}-small`]:{[`&${t}-horizontal:not(${t}-label-vertical) ${t}-item`]:{paddingInlineStart:e.paddingSM,"&:first-child":{paddingInlineStart:0}},[`${t}-item-icon`]:{width:i,height:i,marginTop:0,marginBottom:0,marginInline:`0 ${(0,S.unit)(e.marginXS)}`,fontSize:n,lineHeight:(0,S.unit)(i),textAlign:"center",borderRadius:i},[`${t}-item-title`]:{paddingInlineEnd:e.paddingSM,fontSize:o,lineHeight:(0,S.unit)(i),"&::after":{top:e.calc(i).div(2).equal()}},[`${t}-item-description`]:{color:a,fontSize:o},[`${t}-item-tail`]:{top:e.calc(i).div(2).sub(e.paddingXXS).equal()},[`${t}-item-custom ${t}-item-icon`]:{width:"inherit",height:"inherit",lineHeight:"inherit",background:"none",border:0,borderRadius:0,[`> ${t}-icon`]:{fontSize:i,lineHeight:(0,S.unit)(i),transform:"none"}}}}})(e)),(e=>{let{componentCls:t,iconSizeSM:i,iconSize:n}=e;return{[`&${t}-vertical`]:{display:"flex",flexDirection:"column",[`> ${t}-item`]:{display:"block",flex:"1 0 auto",paddingInlineStart:0,overflow:"visible",[`${t}-item-icon`]:{float:"left",marginInlineEnd:e.margin},[`${t}-item-content`]:{display:"block",minHeight:e.calc(e.controlHeight).mul(1.5).equal(),overflow:"hidden"},[`${t}-item-title`]:{lineHeight:(0,S.unit)(n)},[`${t}-item-description`]:{paddingBottom:e.paddingSM}},[`> ${t}-item > ${t}-item-container > ${t}-item-tail`]:{position:"absolute",top:0,insetInlineStart:e.calc(n).div(2).sub(e.lineWidth).equal(),width:e.lineWidth,height:"100%",padding:`${(0,S.unit)(e.calc(e.marginXXS).mul(1.5).add(n).equal())} 0 ${(0,S.unit)(e.calc(e.marginXXS).mul(1.5).equal())}`,"&::after":{width:e.lineWidth,height:"100%"}},[`> ${t}-item:not(:last-child) > ${t}-item-container > ${t}-item-tail`]:{display:"block"},[` > ${t}-item > ${t}-item-container > ${t}-item-content > ${t}-item-title`]:{"&::after":{display:"none"}},[`&${t}-small ${t}-item-container`]:{[`${t}-item-tail`]:{position:"absolute",top:0,insetInlineStart:e.calc(i).div(2).sub(e.lineWidth).equal(),padding:`${(0,S.unit)(e.calc(e.marginXXS).mul(1.5).add(i).equal())} 0 ${(0,S.unit)(e.calc(e.marginXXS).mul(1.5).equal())}`},[`${t}-item-title`]:{lineHeight:(0,S.unit)(i)}}}}})(e)),(e=>{let{componentCls:t}=e,i=`${t}-item`;return{[`${t}-horizontal`]:{[`${i}-tail`]:{transform:"translateY(-50%)"}}}})(e)),(e=>{let{componentCls:t,iconSize:i,lineHeight:n,iconSizeSM:o}=e;return{[`&${t}-label-vertical`]:{[`${t}-item`]:{overflow:"visible","&-tail":{marginInlineStart:e.calc(i).div(2).add(e.controlHeightLG).equal(),padding:`0 ${(0,S.unit)(e.paddingLG)}`},"&-content":{display:"block",width:e.calc(i).div(2).add(e.controlHeightLG).mul(2).equal(),marginTop:e.marginSM,textAlign:"center"},"&-icon":{display:"inline-block",marginInlineStart:e.controlHeightLG},"&-title":{paddingInlineEnd:0,paddingInlineStart:0,"&::after":{display:"none"}},"&-subtitle":{display:"block",marginBottom:e.marginXXS,marginInlineStart:0,lineHeight:n}},[`&${t}-small:not(${t}-dot)`]:{[`${t}-item`]:{"&-icon":{marginInlineStart:e.calc(i).sub(o).div(2).add(e.controlHeightLG).equal()}}}}}})(e)),(e=>{let{componentCls:t,descriptionMaxWidth:i,lineHeight:n,dotCurrentSize:o,dotSize:a,motionDurationSlow:r}=e;return{[`&${t}-dot, &${t}-dot${t}-small`]:{[`${t}-item`]:{"&-title":{lineHeight:n},"&-tail":{top:e.calc(e.dotSize).sub(e.calc(e.lineWidth).mul(3).equal()).div(2).equal(),width:"100%",marginTop:0,marginBottom:0,marginInline:`${(0,S.unit)(e.calc(i).div(2).equal())} 0`,padding:0,"&::after":{width:`calc(100% - ${(0,S.unit)(e.calc(e.marginSM).mul(2).equal())})`,height:e.calc(e.lineWidth).mul(3).equal(),marginInlineStart:e.marginSM}},"&-icon":{width:a,height:a,marginInlineStart:e.calc(e.descriptionMaxWidth).sub(a).div(2).equal(),paddingInlineEnd:0,lineHeight:(0,S.unit)(a),background:"transparent",border:0,[`${t}-icon-dot`]:{position:"relative",float:"left",width:"100%",height:"100%",borderRadius:100,transition:`all ${r}`,"&::after":{position:"absolute",top:e.calc(e.marginSM).mul(-1).equal(),insetInlineStart:e.calc(a).sub(e.calc(e.controlHeightLG).mul(1.5).equal()).div(2).equal(),width:e.calc(e.controlHeightLG).mul(1.5).equal(),height:e.controlHeight,background:"transparent",content:'""'}}},"&-content":{width:i},[`&-process ${t}-item-icon`]:{position:"relative",top:e.calc(a).sub(o).div(2).equal(),width:o,height:o,lineHeight:(0,S.unit)(o),background:"none",marginInlineStart:e.calc(e.descriptionMaxWidth).sub(o).div(2).equal()},[`&-process ${t}-icon`]:{[`&:first-child ${t}-icon-dot`]:{insetInlineStart:0}}}},[`&${t}-vertical${t}-dot`]:{[`${t}-item-icon`]:{marginTop:e.calc(e.controlHeight).sub(a).div(2).equal(),marginInlineStart:0,background:"none"},[`${t}-item-process ${t}-item-icon`]:{marginTop:e.calc(e.controlHeight).sub(o).div(2).equal(),top:0,insetInlineStart:e.calc(a).sub(o).div(2).equal(),marginInlineStart:0},[`${t}-item > ${t}-item-container > ${t}-item-tail`]:{top:e.calc(e.controlHeight).sub(a).div(2).equal(),insetInlineStart:0,margin:0,padding:`${(0,S.unit)(e.calc(a).add(e.paddingXS).equal())} 0 ${(0,S.unit)(e.paddingXS)}`,"&::after":{marginInlineStart:e.calc(a).sub(e.lineWidth).div(2).equal()}},[`&${t}-small`]:{[`${t}-item-icon`]:{marginTop:e.calc(e.controlHeightSM).sub(a).div(2).equal()},[`${t}-item-process ${t}-item-icon`]:{marginTop:e.calc(e.controlHeightSM).sub(o).div(2).equal()},[`${t}-item > ${t}-item-container > ${t}-item-tail`]:{top:e.calc(e.controlHeightSM).sub(a).div(2).equal()}},[`${t}-item:first-child ${t}-icon-dot`]:{insetInlineStart:0},[`${t}-item-content`]:{width:"inherit"}}}})(e)),(e=>{let{componentCls:t,navContentMaxWidth:i,navArrowColor:n,stepsNavActiveColor:o,motionDurationSlow:a}=e;return{[`&${t}-navigation`]:{paddingTop:e.paddingSM,[`&${t}-small`]:{[`${t}-item`]:{"&-container":{marginInlineStart:e.calc(e.marginSM).mul(-1).equal()}}},[`${t}-item`]:{overflow:"visible",textAlign:"center","&-container":{display:"inline-block",height:"100%",marginInlineStart:e.calc(e.margin).mul(-1).equal(),paddingBottom:e.paddingSM,textAlign:"start",transition:`opacity ${a}`,[`${t}-item-content`]:{maxWidth:i},[`${t}-item-title`]:Object.assign(Object.assign({maxWidth:"100%",paddingInlineEnd:0},v.textEllipsis),{"&::after":{display:"none"}})},[`&:not(${t}-item-active)`]:{[`${t}-item-container[role='button']`]:{cursor:"pointer","&:hover":{opacity:.85}}},"&:last-child":{flex:1,"&::after":{display:"none"}},"&::after":{position:"absolute",top:`calc(50% - ${(0,S.unit)(e.calc(e.paddingSM).div(2).equal())})`,insetInlineStart:"100%",display:"inline-block",width:e.fontSizeIcon,height:e.fontSizeIcon,borderTop:`${(0,S.unit)(e.lineWidth)} ${e.lineType} ${n}`,borderBottom:"none",borderInlineStart:"none",borderInlineEnd:`${(0,S.unit)(e.lineWidth)} ${e.lineType} ${n}`,transform:"translateY(-50%) translateX(-50%) rotate(45deg)",content:'""'},"&::before":{position:"absolute",bottom:0,insetInlineStart:"50%",display:"inline-block",width:0,height:e.lineWidthBold,backgroundColor:o,transition:`width ${a}, inset-inline-start ${a}`,transitionTimingFunction:"ease-out",content:'""'}},[`${t}-item${t}-item-active::before`]:{insetInlineStart:0,width:"100%"}},[`&${t}-navigation${t}-vertical`]:{[`> ${t}-item`]:{marginInlineEnd:0,"&::before":{display:"none"},[`&${t}-item-active::before`]:{top:0,insetInlineEnd:0,insetInlineStart:"unset",display:"block",width:e.calc(e.lineWidth).mul(3).equal(),height:`calc(100% - ${(0,S.unit)(e.marginLG)})`},"&::after":{position:"relative",insetInlineStart:"50%",display:"block",width:e.calc(e.controlHeight).mul(.25).equal(),height:e.calc(e.controlHeight).mul(.25).equal(),marginBottom:e.marginXS,textAlign:"center",transform:"translateY(-50%) translateX(-50%) rotate(135deg)"},"&:last-child":{"&::after":{display:"none"}},[`> ${t}-item-container > ${t}-item-tail`]:{visibility:"hidden"}}},[`&${t}-navigation${t}-horizontal`]:{[`> ${t}-item > ${t}-item-container > ${t}-item-tail`]:{visibility:"hidden"}}}})(e)),(e=>{let{componentCls:t}=e;return{[`&${t}-rtl`]:{direction:"rtl",[`${t}-item`]:{"&-subtitle":{float:"left"}},[`&${t}-navigation`]:{[`${t}-item::after`]:{transform:"rotate(-45deg)"}},[`&${t}-vertical`]:{[`> ${t}-item`]:{"&::after":{transform:"rotate(225deg)"},[`${t}-item-icon`]:{float:"right"}}},[`&${t}-dot`]:{[`${t}-item-icon ${t}-icon-dot, &${t}-small ${t}-item-icon ${t}-icon-dot`]:{float:"right"}}}}})(e)),(e=>{let{antCls:t,componentCls:i,iconSize:n,iconSizeSM:o,processIconColor:a,marginXXS:r,lineWidthBold:l,lineWidth:s,paddingXXS:c}=e,d=e.calc(n).add(e.calc(l).mul(4).equal()).equal(),p=e.calc(o).add(e.calc(e.lineWidth).mul(4).equal()).equal();return{[`&${i}-with-progress`]:{[`${i}-item`]:{paddingTop:c,[`&-process ${i}-item-container ${i}-item-icon ${i}-icon`]:{color:a}},[`&${i}-vertical > ${i}-item `]:{paddingInlineStart:c,[`> ${i}-item-container > ${i}-item-tail`]:{top:r,insetInlineStart:e.calc(n).div(2).sub(s).add(c).equal()}},[`&, &${i}-small`]:{[`&${i}-horizontal ${i}-item:first-child`]:{paddingBottom:c,paddingInlineStart:c}},[`&${i}-small${i}-vertical > ${i}-item > ${i}-item-container > ${i}-item-tail`]:{insetInlineStart:e.calc(o).div(2).sub(s).add(c).equal()},[`&${i}-label-vertical ${i}-item ${i}-item-tail`]:{top:e.calc(n).div(2).add(c).equal()},[`${i}-item-icon`]:{position:"relative",[`${t}-progress`]:{position:"absolute",insetInlineStart:"50%",top:"50%",transform:"translate(-50%, -50%)","&-inner":{width:`${(0,S.unit)(d)} !important`,height:`${(0,S.unit)(d)} !important`}}},[`&${i}-small`]:{[`&${i}-label-vertical ${i}-item ${i}-item-tail`]:{top:e.calc(o).div(2).add(c).equal()},[`${i}-item-icon ${t}-progress-inner`]:{width:`${(0,S.unit)(p)} !important`,height:`${(0,S.unit)(p)} !important`}}}}})(e)),(e=>{let{componentCls:t,inlineDotSize:i,inlineTitleColor:n,inlineTailColor:o}=e,a=e.calc(e.paddingXS).add(e.lineWidth).equal(),r={[`${t}-item-container ${t}-item-content ${t}-item-title`]:{color:n}};return{[`&${t}-inline`]:{width:"auto",display:"inline-flex",[`${t}-item`]:{flex:"none","&-container":{padding:`${(0,S.unit)(a)} ${(0,S.unit)(e.paddingXXS)} 0`,margin:`0 ${(0,S.unit)(e.calc(e.marginXXS).div(2).equal())}`,borderRadius:e.borderRadiusSM,cursor:"pointer",transition:`background-color ${e.motionDurationMid}`,"&:hover":{background:e.controlItemBgHover},"&[role='button']:hover":{opacity:1}},"&-icon":{width:i,height:i,marginInlineStart:`calc(50% - ${(0,S.unit)(e.calc(i).div(2).equal())})`,[`> ${t}-icon`]:{top:0},[`${t}-icon-dot`]:{borderRadius:e.calc(e.fontSizeSM).div(4).equal(),"&::after":{display:"none"}}},"&-content":{width:"auto",marginTop:e.calc(e.marginXS).sub(e.lineWidth).equal()},"&-title":{color:n,fontSize:e.fontSizeSM,lineHeight:e.lineHeightSM,fontWeight:"normal",marginBottom:e.calc(e.marginXXS).div(2).equal()},"&-description":{display:"none"},"&-tail":{marginInlineStart:0,top:e.calc(i).div(2).add(a).equal(),transform:"translateY(-50%)","&:after":{width:"100%",height:e.lineWidth,borderRadius:0,marginInlineStart:0,background:o}},[`&:first-child ${t}-item-tail`]:{width:"50%",marginInlineStart:"50%"},[`&:last-child ${t}-item-tail`]:{display:"block",width:"50%"},"&-wait":Object.assign({[`${t}-item-icon ${t}-icon ${t}-icon-dot`]:{backgroundColor:e.colorBorderBg,border:`${(0,S.unit)(e.lineWidth)} ${e.lineType} ${o}`}},r),"&-finish":Object.assign({[`${t}-item-tail::after`]:{backgroundColor:o},[`${t}-item-icon ${t}-icon ${t}-icon-dot`]:{backgroundColor:o,border:`${(0,S.unit)(e.lineWidth)} ${e.lineType} ${o}`}},r),"&-error":r,"&-active, &-process":Object.assign({[`${t}-item-icon`]:{width:i,height:i,marginInlineStart:`calc(50% - ${(0,S.unit)(e.calc(i).div(2).equal())})`,top:0}},r),[`&:not(${t}-item-active) > ${t}-item-container[role='button']:hover`]:{[`${t}-item-title`]:{color:n}}}}}})(e))}})((0,I.mergeToken)(e,{processIconColor:n,processTitleColor:o,processDescriptionColor:o,processIconBgColor:a,processIconBorderColor:a,processDotColor:a,processTailColor:d,waitTitleColor:r,waitDescriptionColor:r,waitTailColor:d,waitDotColor:t,finishIconColor:a,finishTitleColor:o,finishDescriptionColor:r,finishTailColor:a,finishDotColor:a,errorIconColor:n,errorTitleColor:s,errorDescriptionColor:s,errorTailColor:d,errorIconBgColor:s,errorIconBorderColor:s,errorDotColor:s,stepsNavActiveColor:a,stepsProgressSize:i,inlineDotSize:6,inlineTitleColor:l,inlineTailColor:c}))},e=>({titleLineHeight:e.controlHeight,customIconSize:e.controlHeight,customIconTop:0,customIconFontSize:e.controlHeightSM,iconSize:e.controlHeight,iconTop:-.5,iconFontSize:e.fontSize,iconSizeSM:e.fontSizeHeading3,dotSize:e.controlHeight/4,dotCurrentSize:e.controlHeightLG/4,navArrowColor:e.colorTextDisabled,navContentMaxWidth:"unset",descriptionMaxWidth:140,waitIconColor:e.wireframe?e.colorTextDisabled:e.colorTextLabel,waitIconBgColor:e.wireframe?e.colorBgContainer:e.colorFillContent,waitIconBorderColor:e.wireframe?e.colorTextDisabled:"transparent",finishIconBgColor:e.wireframe?e.colorBgContainer:e.controlItemBgActive,finishIconBorderColor:e.wireframe?e.colorPrimary:e.controlItemBgActive}));var x=e.i(876556),E=function(e,t){var i={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&0>t.indexOf(n)&&(i[n]=e[n]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var o=0,n=Object.getOwnPropertySymbols(e);o<n.length;o++)0>t.indexOf(n[o])&&Object.prototype.propertyIsEnumerable.call(e,n[o])&&(i[n[o]]=e[n[o]]);return i};let T=e=>{var a,r;let{percent:l,size:s,className:c,rootClassName:d,direction:p,items:m,responsive:u=!0,current:S=0,children:v,style:y}=e,I=E(e,["percent","size","className","rootClassName","direction","items","responsive","current","children","style"]),{xs:w}=(0,$.default)(u),{getPrefixCls:T,direction:O,className:k,style:j}=(0,f.useComponentConfig)("steps"),N=t.useMemo(()=>u&&w?"vertical":p,[u,w,p]),q=(0,h.default)(s),A=T("steps",e.prefixCls),[z,H,D]=C(A),P="inline"===e.type,M=T("",e.iconPrefix),B=(a=m,r=v,a?a:(0,x.default)(r).map(e=>{if(t.isValidElement(e)){let{props:t}=e;return Object.assign({},t)}return null}).filter(e=>e)),R=P?void 0:l,L=Object.assign(Object.assign({},j),y),W=(0,o.default)(k,{[`${A}-rtl`]:"rtl"===O,[`${A}-with-progress`]:void 0!==R},c,d,H,D),X={finish:t.createElement(i.default,{className:`${A}-finish-icon`}),error:t.createElement(n.default,{className:`${A}-error-icon`})};return z(t.createElement(g,Object.assign({icons:X},I,{style:L,current:S,size:q,items:B,itemRender:P?(e,i)=>e.description?t.createElement(_.default,{title:e.description},i):i:void 0,stepIcon:({node:e,status:i})=>"process"===i&&void 0!==R?t.createElement("div",{className:`${A}-progress-icon`},t.createElement(b.default,{type:"circle",percent:R,size:"small"===q?32:40,strokeWidth:4,format:()=>null}),e):e,direction:N,prefixCls:A,iconPrefix:M,className:W})))};T.Step=g.Step,e.s(["Steps",0,T],280898)}]);