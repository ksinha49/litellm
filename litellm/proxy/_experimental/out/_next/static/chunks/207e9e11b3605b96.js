(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,190272,785913,e=>{"use strict";var t,i,r=((t={}).AUDIO_SPEECH="audio_speech",t.AUDIO_TRANSCRIPTION="audio_transcription",t.IMAGE_GENERATION="image_generation",t.VIDEO_GENERATION="video_generation",t.CHAT="chat",t.RESPONSES="responses",t.IMAGE_EDITS="image_edits",t.ANTHROPIC_MESSAGES="anthropic_messages",t.EMBEDDING="embedding",t),o=((i={}).IMAGE="image",i.VIDEO="video",i.CHAT="chat",i.RESPONSES="responses",i.IMAGE_EDITS="image_edits",i.ANTHROPIC_MESSAGES="anthropic_messages",i.EMBEDDINGS="embeddings",i.SPEECH="speech",i.TRANSCRIPTION="transcription",i.A2A_AGENTS="a2a_agents",i.MCP="mcp",i);let n={image_generation:"image",video_generation:"video",chat:"chat",responses:"responses",image_edits:"image_edits",anthropic_messages:"anthropic_messages",audio_speech:"speech",audio_transcription:"transcription",embedding:"embeddings"};e.s(["EndpointType",()=>o,"getEndpointType",0,e=>{if(console.log("getEndpointType:",e),Object.values(r).includes(e)){let t=n[e];return console.log("endpointType:",t),t}return"chat"}],785913),e.s(["generateCodeSnippet",0,e=>{let t,{apiKeySource:i,accessToken:r,apiKey:n,inputMessage:a,chatHistory:s,selectedTags:l,selectedVectorStores:c,selectedGuardrails:u,selectedPolicies:p,selectedMCPServers:d,mcpServers:m,mcpServerToolRestrictions:g,selectedVoice:f,endpointType:h,selectedModel:_,selectedSdk:v,proxySettings:y}=e,b="session"===i?r:n,S=window.location.origin,x=y?.LITELLM_UI_API_DOC_BASE_URL;x&&x.trim()?S=x:y?.PROXY_BASE_URL&&(S=y.PROXY_BASE_URL);let w=a||"Your prompt here",$=w.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n"),C=s.filter(e=>!e.isImage).map(({role:e,content:t})=>({role:e,content:t})),E={};l.length>0&&(E.tags=l),c.length>0&&(E.vector_stores=c),u.length>0&&(E.guardrails=u),p.length>0&&(E.policies=p);let O=_||"your-model-name",k="azure"===v?`import openai

client = openai.AzureOpenAI(
	api_key="${b||"YOUR_LITELLM_API_KEY"}",
	azure_endpoint="${S}",
	api_version="2024-02-01"
)`:`import openai

client = openai.OpenAI(
	api_key="${b||"YOUR_LITELLM_API_KEY"}",
	base_url="${S}"
)`;switch(h){case o.CHAT:{let e=Object.keys(E).length>0,i="";if(e){let e=JSON.stringify({metadata:E},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();i=`,
    extra_body=${e}`}let r=C.length>0?C:[{role:"user",content:w}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.chat.completions.create(
    model="${O}",
    messages=${JSON.stringify(r,null,4)}${i}
)

print(response)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.chat.completions.create(
#     model="${O}",
#     messages=[
#         {
#             "role": "user",
#             "content": [
#                 {
#                     "type": "text",
#                     "text": "${$}"
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
`;break}case o.RESPONSES:{let e=Object.keys(E).length>0,i="";if(e){let e=JSON.stringify({metadata:E},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();i=`,
    extra_body=${e}`}let r=C.length>0?C:[{role:"user",content:w}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.responses.create(
    model="${O}",
    input=${JSON.stringify(r,null,4)}${i}
)

print(response.output_text)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.responses.create(
#     model="${O}",
#     input=[
#         {
#             "role": "user",
#             "content": [
#                 {"type": "input_text", "text": "${$}"},
#                 {
#                     "type": "input_image",
#                     "image_url": f"data:image/jpeg;base64,{base64_file}",  # or data:application/pdf;base64,{base64_file}
#                 },
#             ],
#         }
#     ]${i}
# )
# print(response_with_file.output_text)
`;break}case o.IMAGE:t="azure"===v?`
# NOTE: The Azure SDK does not have a direct equivalent to the multi-modal 'responses.create' method shown for OpenAI.
# This snippet uses 'client.images.generate' and will create a new image based on your prompt.
# It does not use the uploaded image, as 'client.images.generate' does not support image inputs in this context.
import os
import requests
import json
import time
from PIL import Image

result = client.images.generate(
	model="${O}",
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
prompt = "${$}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${O}",
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
`;break;case o.IMAGE_EDITS:t="azure"===v?`
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
prompt = "${$}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${O}",
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
prompt = "${$}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${O}",
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
	input="${a||"Your string here"}",
	model="${O}",
	encoding_format="base64" # or "float"
)

print(response.data[0].embedding)
`;break;case o.TRANSCRIPTION:t=`
# Open the audio file
audio_file = open("path/to/your/audio/file.mp3", "rb")

# Make the transcription request
response = client.audio.transcriptions.create(
	model="${O}",
	file=audio_file${a?`,
	prompt="${a.replace(/"/g,'\\"')}"`:""}
)

print(response.text)
`;break;case o.SPEECH:t=`
# Make the text-to-speech request
response = client.audio.speech.create(
	model="${O}",
	input="${a||"Your text to convert to speech here"}",
	voice="${f}"  # Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
)

# Save the audio to a file
output_filename = "output_speech.mp3"
response.stream_to_file(output_filename)
print(f"Audio saved to {output_filename}")

# Optional: Customize response format and speed
# response = client.audio.speech.create(
#     model="${O}",
#     input="${a||"Your text to convert to speech here"}",
#     voice="alloy",
#     response_format="mp3",  # Options: mp3, opus, aac, flac, wav, pcm
#     speed=1.0  # Range: 0.25 to 4.0
# )
# response.stream_to_file("output_speech.mp3")
`;break;default:t="\n# Code generation for this endpoint is not implemented yet."}return`${k}
${t}`}],190272)},516015,(e,t,i)=>{},898547,(e,t,i)=>{var r=e.i(247167);e.r(516015);var o=e.r(271645),n=o&&"object"==typeof o&&"default"in o?o:{default:o},a=void 0!==r.default&&r.default.env&&!0,s=function(e){return"[object String]"===Object.prototype.toString.call(e)},l=function(){function e(e){var t=void 0===e?{}:e,i=t.name,r=void 0===i?"stylesheet":i,o=t.optimizeForSpeed,n=void 0===o?a:o;c(s(r),"`name` must be a string"),this._name=r,this._deletedRulePlaceholder="#"+r+"-deleted-rule____{}",c("boolean"==typeof n,"`optimizeForSpeed` must be a boolean"),this._optimizeForSpeed=n,this._serverSheet=void 0,this._tags=[],this._injected=!1,this._rulesCount=0;var l="u">typeof window&&document.querySelector('meta[property="csp-nonce"]');this._nonce=l?l.getAttribute("content"):null}var t,i=e.prototype;return i.setOptimizeForSpeed=function(e){c("boolean"==typeof e,"`setOptimizeForSpeed` accepts a boolean"),c(0===this._rulesCount,"optimizeForSpeed cannot be when rules have already been inserted"),this.flush(),this._optimizeForSpeed=e,this.inject()},i.isOptimizeForSpeed=function(){return this._optimizeForSpeed},i.inject=function(){var e=this;if(c(!this._injected,"sheet already injected"),this._injected=!0,"u">typeof window&&this._optimizeForSpeed){this._tags[0]=this.makeStyleTag(this._name),this._optimizeForSpeed="insertRule"in this.getSheet(),this._optimizeForSpeed||(a||console.warn("StyleSheet: optimizeForSpeed mode not supported falling back to standard mode."),this.flush(),this._injected=!0);return}this._serverSheet={cssRules:[],insertRule:function(t,i){return"number"==typeof i?e._serverSheet.cssRules[i]={cssText:t}:e._serverSheet.cssRules.push({cssText:t}),i},deleteRule:function(t){e._serverSheet.cssRules[t]=null}}},i.getSheetForTag=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]},i.getSheet=function(){return this.getSheetForTag(this._tags[this._tags.length-1])},i.insertRule=function(e,t){if(c(s(e),"`insertRule` accepts only strings"),"u"<typeof window)return"number"!=typeof t&&(t=this._serverSheet.cssRules.length),this._serverSheet.insertRule(e,t),this._rulesCount++;if(this._optimizeForSpeed){var i=this.getSheet();"number"!=typeof t&&(t=i.cssRules.length);try{i.insertRule(e,t)}catch(t){return a||console.warn("StyleSheet: illegal rule: \n\n"+e+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),-1}}else{var r=this._tags[t];this._tags.push(this.makeStyleTag(this._name,e,r))}return this._rulesCount++},i.replaceRule=function(e,t){if(this._optimizeForSpeed||"u"<typeof window){var i="u">typeof window?this.getSheet():this._serverSheet;if(t.trim()||(t=this._deletedRulePlaceholder),!i.cssRules[e])return e;i.deleteRule(e);try{i.insertRule(t,e)}catch(r){a||console.warn("StyleSheet: illegal rule: \n\n"+t+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),i.insertRule(this._deletedRulePlaceholder,e)}}else{var r=this._tags[e];c(r,"old rule at index `"+e+"` not found"),r.textContent=t}return e},i.deleteRule=function(e){if("u"<typeof window)return void this._serverSheet.deleteRule(e);if(this._optimizeForSpeed)this.replaceRule(e,"");else{var t=this._tags[e];c(t,"rule at index `"+e+"` not found"),t.parentNode.removeChild(t),this._tags[e]=null}},i.flush=function(){this._injected=!1,this._rulesCount=0,"u">typeof window?(this._tags.forEach(function(e){return e&&e.parentNode.removeChild(e)}),this._tags=[]):this._serverSheet.cssRules=[]},i.cssRules=function(){var e=this;return"u"<typeof window?this._serverSheet.cssRules:this._tags.reduce(function(t,i){return i?t=t.concat(Array.prototype.map.call(e.getSheetForTag(i).cssRules,function(t){return t.cssText===e._deletedRulePlaceholder?null:t})):t.push(null),t},[])},i.makeStyleTag=function(e,t,i){t&&c(s(t),"makeStyleTag accepts only strings as second parameter");var r=document.createElement("style");this._nonce&&r.setAttribute("nonce",this._nonce),r.type="text/css",r.setAttribute("data-"+e,""),t&&r.appendChild(document.createTextNode(t));var o=document.head||document.getElementsByTagName("head")[0];return i?o.insertBefore(r,i):o.appendChild(r),r},t=[{key:"length",get:function(){return this._rulesCount}}],function(e,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}(e.prototype,t),e}();function c(e,t){if(!e)throw Error("StyleSheet: "+t+".")}var u=function(e){for(var t=5381,i=e.length;i;)t=33*t^e.charCodeAt(--i);return t>>>0},p={};function d(e,t){if(!t)return"jsx-"+e;var i=String(t),r=e+i;return p[r]||(p[r]="jsx-"+u(e+"-"+i)),p[r]}function m(e,t){"u"<typeof window&&(t=t.replace(/\/style/gi,"\\/style"));var i=e+t;return p[i]||(p[i]=t.replace(/__jsx-style-dynamic-selector/g,e)),p[i]}var g=function(){function e(e){var t=void 0===e?{}:e,i=t.styleSheet,r=void 0===i?null:i,o=t.optimizeForSpeed,n=void 0!==o&&o;this._sheet=r||new l({name:"styled-jsx",optimizeForSpeed:n}),this._sheet.inject(),r&&"boolean"==typeof n&&(this._sheet.setOptimizeForSpeed(n),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),this._fromServer=void 0,this._indices={},this._instancesCounts={}}var t=e.prototype;return t.add=function(e){var t=this;void 0===this._optimizeForSpeed&&(this._optimizeForSpeed=Array.isArray(e.children),this._sheet.setOptimizeForSpeed(this._optimizeForSpeed),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),"u">typeof window&&!this._fromServer&&(this._fromServer=this.selectFromServer(),this._instancesCounts=Object.keys(this._fromServer).reduce(function(e,t){return e[t]=0,e},{}));var i=this.getIdAndRules(e),r=i.styleId,o=i.rules;if(r in this._instancesCounts){this._instancesCounts[r]+=1;return}var n=o.map(function(e){return t._sheet.insertRule(e)}).filter(function(e){return -1!==e});this._indices[r]=n,this._instancesCounts[r]=1},t.remove=function(e){var t=this,i=this.getIdAndRules(e).styleId;if(function(e,t){if(!e)throw Error("StyleSheetRegistry: "+t+".")}(i in this._instancesCounts,"styleId: `"+i+"` not found"),this._instancesCounts[i]-=1,this._instancesCounts[i]<1){var r=this._fromServer&&this._fromServer[i];r?(r.parentNode.removeChild(r),delete this._fromServer[i]):(this._indices[i].forEach(function(e){return t._sheet.deleteRule(e)}),delete this._indices[i]),delete this._instancesCounts[i]}},t.update=function(e,t){this.add(t),this.remove(e)},t.flush=function(){this._sheet.flush(),this._sheet.inject(),this._fromServer=void 0,this._indices={},this._instancesCounts={}},t.cssRules=function(){var e=this,t=this._fromServer?Object.keys(this._fromServer).map(function(t){return[t,e._fromServer[t]]}):[],i=this._sheet.cssRules();return t.concat(Object.keys(this._indices).map(function(t){return[t,e._indices[t].map(function(e){return i[e].cssText}).join(e._optimizeForSpeed?"":"\n")]}).filter(function(e){return!!e[1]}))},t.styles=function(e){var t,i;return t=this.cssRules(),void 0===(i=e)&&(i={}),t.map(function(e){var t=e[0],r=e[1];return n.default.createElement("style",{id:"__"+t,key:"__"+t,nonce:i.nonce?i.nonce:void 0,dangerouslySetInnerHTML:{__html:r}})})},t.getIdAndRules=function(e){var t=e.children,i=e.dynamic,r=e.id;if(i){var o=d(r,i);return{styleId:o,rules:Array.isArray(t)?t.map(function(e){return m(o,e)}):[m(o,t)]}}return{styleId:d(r),rules:Array.isArray(t)?t:[t]}},t.selectFromServer=function(){return Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]')).reduce(function(e,t){return e[t.id.slice(2)]=t,e},{})},e}(),f=o.createContext(null);function h(){return new g}function _(){return o.useContext(f)}f.displayName="StyleSheetContext";var v=n.default.useInsertionEffect||n.default.useLayoutEffect,y="u">typeof window?h():void 0;function b(e){var t=y||_();return t&&("u"<typeof window?t.add(e):v(function(){return t.add(e),function(){t.remove(e)}},[e.id,String(e.dynamic)])),null}b.dynamic=function(e){return e.map(function(e){return d(e[0],e[1])}).join(" ")},i.StyleRegistry=function(e){var t=e.registry,i=e.children,r=o.useContext(f),a=o.useState(function(){return r||t||h()})[0];return n.default.createElement(f.Provider,{value:a},i)},i.createStyleRegistry=h,i.style=b,i.useStyleRegistry=_},437902,(e,t,i)=>{t.exports=e.r(898547).style},829672,836938,310730,e=>{"use strict";e.i(247167);var t=e.i(271645),i=e.i(343794),r=e.i(914949),o=e.i(404948);let n=e=>e?"function"==typeof e?e():e:null;e.s(["getRenderPropValue",0,n],836938);var a=e.i(613541),s=e.i(763731),l=e.i(242064),c=e.i(491816);e.i(793154);var u=e.i(880476),p=e.i(183293),d=e.i(717356),m=e.i(320560),g=e.i(307358),f=e.i(246422),h=e.i(838378),_=e.i(617933);let v=(0,f.genStyleHooks)("Popover",e=>{let{colorBgElevated:t,colorText:i}=e,r=(0,h.mergeToken)(e,{popoverBg:t,popoverColor:i});return[(e=>{let{componentCls:t,popoverColor:i,titleMinWidth:r,fontWeightStrong:o,innerPadding:n,boxShadowSecondary:a,colorTextHeading:s,borderRadiusLG:l,zIndexPopup:c,titleMarginBottom:u,colorBgElevated:d,popoverBg:g,titleBorderBottom:f,innerContentPadding:h,titlePadding:_}=e;return[{[t]:Object.assign(Object.assign({},(0,p.resetComponent)(e)),{position:"absolute",top:0,left:{_skip_check_:!0,value:0},zIndex:c,fontWeight:"normal",whiteSpace:"normal",textAlign:"start",cursor:"auto",userSelect:"text","--valid-offset-x":"var(--arrow-offset-horizontal, var(--arrow-x))",transformOrigin:"var(--valid-offset-x, 50%) var(--arrow-y, 50%)","--antd-arrow-background-color":d,width:"max-content",maxWidth:"100vw","&-rtl":{direction:"rtl"},"&-hidden":{display:"none"},[`${t}-content`]:{position:"relative"},[`${t}-inner`]:{backgroundColor:g,backgroundClip:"padding-box",borderRadius:l,boxShadow:a,padding:n},[`${t}-title`]:{minWidth:r,marginBottom:u,color:s,fontWeight:o,borderBottom:f,padding:_},[`${t}-inner-content`]:{color:i,padding:h}})},(0,m.default)(e,"var(--antd-arrow-background-color)"),{[`${t}-pure`]:{position:"relative",maxWidth:"none",margin:e.sizePopupArrow,display:"inline-block",[`${t}-content`]:{display:"inline-block"}}}]})(r),(e=>{let{componentCls:t}=e;return{[t]:_.PresetColors.map(i=>{let r=e[`${i}6`];return{[`&${t}-${i}`]:{"--antd-arrow-background-color":r,[`${t}-inner`]:{backgroundColor:r},[`${t}-arrow`]:{background:"transparent"}}}})}})(r),(0,d.initZoomMotion)(r,"zoom-big")]},e=>{let{lineWidth:t,controlHeight:i,fontHeight:r,padding:o,wireframe:n,zIndexPopupBase:a,borderRadiusLG:s,marginXS:l,lineType:c,colorSplit:u,paddingSM:p}=e,d=i-r;return Object.assign(Object.assign(Object.assign({titleMinWidth:177,zIndexPopup:a+30},(0,g.getArrowToken)(e)),(0,m.getArrowOffsetToken)({contentRadius:s,limitVerticalRadius:!0})),{innerPadding:12*!n,titleMarginBottom:n?0:l,titlePadding:n?`${d/2}px ${o}px ${d/2-t}px`:0,titleBorderBottom:n?`${t}px ${c} ${u}`:"none",innerContentPadding:n?`${p}px ${o}px`:0})},{resetStyle:!1,deprecatedTokens:[["width","titleMinWidth"],["minWidth","titleMinWidth"]]});var y=function(e,t){var i={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&0>t.indexOf(r)&&(i[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var o=0,r=Object.getOwnPropertySymbols(e);o<r.length;o++)0>t.indexOf(r[o])&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(i[r[o]]=e[r[o]]);return i};let b=({title:e,content:i,prefixCls:r})=>e||i?t.createElement(t.Fragment,null,e&&t.createElement("div",{className:`${r}-title`},e),i&&t.createElement("div",{className:`${r}-inner-content`},i)):null,S=e=>{let{hashId:r,prefixCls:o,className:a,style:s,placement:l="top",title:c,content:p,children:d}=e,m=n(c),g=n(p),f=(0,i.default)(r,o,`${o}-pure`,`${o}-placement-${l}`,a);return t.createElement("div",{className:f,style:s},t.createElement("div",{className:`${o}-arrow`}),t.createElement(u.Popup,Object.assign({},e,{className:r,prefixCls:o}),d||t.createElement(b,{prefixCls:o,title:m,content:g})))},x=e=>{let{prefixCls:r,className:o}=e,n=y(e,["prefixCls","className"]),{getPrefixCls:a}=t.useContext(l.ConfigContext),s=a("popover",r),[c,u,p]=v(s);return c(t.createElement(S,Object.assign({},n,{prefixCls:s,hashId:u,className:(0,i.default)(o,p)})))};e.s(["Overlay",0,b,"default",0,x],310730);var w=function(e,t){var i={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&0>t.indexOf(r)&&(i[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var o=0,r=Object.getOwnPropertySymbols(e);o<r.length;o++)0>t.indexOf(r[o])&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(i[r[o]]=e[r[o]]);return i};let $=t.forwardRef((e,u)=>{var p,d;let{prefixCls:m,title:g,content:f,overlayClassName:h,placement:_="top",trigger:y="hover",children:S,mouseEnterDelay:x=.1,mouseLeaveDelay:$=.1,onOpenChange:C,overlayStyle:E={},styles:O,classNames:k}=e,j=w(e,["prefixCls","title","content","overlayClassName","placement","trigger","children","mouseEnterDelay","mouseLeaveDelay","onOpenChange","overlayStyle","styles","classNames"]),{getPrefixCls:I,className:R,style:z,classNames:A,styles:N}=(0,l.useComponentConfig)("popover"),P=I("popover",m),[T,M,F]=v(P),D=I(),L=(0,i.default)(h,M,F,R,A.root,null==k?void 0:k.root),H=(0,i.default)(A.body,null==k?void 0:k.body),[B,W]=(0,r.default)(!1,{value:null!=(p=e.open)?p:e.visible,defaultValue:null!=(d=e.defaultOpen)?d:e.defaultVisible}),V=(e,t)=>{W(e,!0),null==C||C(e,t)},G=n(g),X=n(f);return T(t.createElement(c.default,Object.assign({placement:_,trigger:y,mouseEnterDelay:x,mouseLeaveDelay:$},j,{prefixCls:P,classNames:{root:L,body:H},styles:{root:Object.assign(Object.assign(Object.assign(Object.assign({},N.root),z),E),null==O?void 0:O.root),body:Object.assign(Object.assign({},N.body),null==O?void 0:O.body)},ref:u,open:B,onOpenChange:e=>{V(e)},overlay:G||X?t.createElement(b,{prefixCls:P,title:G,content:X}):null,transitionName:(0,a.getTransitionName)(D,"zoom-big",j.transitionName),"data-popover-inject":!0}),(0,s.cloneElement)(S,{onKeyDown:e=>{var i,r;(0,t.isValidElement)(S)&&(null==(r=null==S?void 0:(i=S.props).onKeyDown)||r.call(i,e)),e.keyCode===o.default.ESC&&V(!1,e)}})))});$._InternalPanelDoNotUseOrYouWillBeFired=x,e.s(["default",0,$],829672)},282786,e=>{"use strict";var t=e.i(829672);e.s(["Popover",()=>t.default])},872934,e=>{"use strict";e.i(247167);var t=e.i(931067),i=e.i(271645);let r={icon:{tag:"svg",attrs:{"fill-rule":"evenodd",viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M880 912H144c-17.7 0-32-14.3-32-32V144c0-17.7 14.3-32 32-32h360c4.4 0 8 3.6 8 8v56c0 4.4-3.6 8-8 8H184v656h656V520c0-4.4 3.6-8 8-8h56c4.4 0 8 3.6 8 8v360c0 17.7-14.3 32-32 32zM770.87 199.13l-52.2-52.2a8.01 8.01 0 014.7-13.6l179.4-21c5.1-.6 9.5 3.7 8.9 8.9l-21 179.4c-.8 6.6-8.9 9.4-13.6 4.7l-52.4-52.4-256.2 256.2a8.03 8.03 0 01-11.3 0l-42.4-42.4a8.03 8.03 0 010-11.3l256.1-256.3z"}}]},name:"export",theme:"outlined"};var o=e.i(9583),n=i.forwardRef(function(e,n){return i.createElement(o.default,(0,t.default)({},e,{ref:n,icon:r}))});e.s(["ExportOutlined",0,n],872934)},458505,e=>{"use strict";e.i(247167);var t=e.i(931067),i=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm47.7-395.2l-25.4-5.9V348.6c38 5.2 61.5 29 65.5 58.2.5 4 3.9 6.9 7.9 6.9h44.9c4.7 0 8.4-4.1 8-8.8-6.1-62.3-57.4-102.3-125.9-109.2V263c0-4.4-3.6-8-8-8h-28.1c-4.4 0-8 3.6-8 8v33c-70.8 6.9-126.2 46-126.2 119 0 67.6 49.8 100.2 102.1 112.7l24.7 6.3v142.7c-44.2-5.9-69-29.5-74.1-61.3-.6-3.8-4-6.6-7.9-6.6H363c-4.7 0-8.4 4-8 8.7 4.5 55 46.2 105.6 135.2 112.1V761c0 4.4 3.6 8 8 8h28.4c4.4 0 8-3.6 8-8.1l-.2-31.7c78.3-6.9 134.3-48.8 134.3-124-.1-69.4-44.2-100.4-109-116.4zm-68.6-16.2c-5.6-1.6-10.3-3.1-15-5-33.8-12.2-49.5-31.9-49.5-57.3 0-36.3 27.5-57 64.5-61.7v124zM534.3 677V543.3c3.1.9 5.9 1.6 8.8 2.2 47.3 14.4 63.2 34.4 63.2 65.1 0 39.1-29.4 62.6-72 66.4z"}}]},name:"dollar",theme:"outlined"};var o=e.i(9583),n=i.forwardRef(function(e,n){return i.createElement(o.default,(0,t.default)({},e,{ref:n,icon:r}))});e.s(["DollarOutlined",0,n],458505)},56456,e=>{"use strict";var t=e.i(739295);e.s(["LoadingOutlined",()=>t.default])},921511,e=>{"use strict";var t=e.i(843476),i=e.i(271645),r=e.i(199133),o=e.i(764205);e.s(["default",0,({onChange:e,value:n,className:a,accessToken:s,disabled:l})=>{let[c,u]=(0,i.useState)([]),[p,d]=(0,i.useState)(!1);return(0,i.useEffect)(()=>{(async()=>{if(s){d(!0);try{let e=await (0,o.getPoliciesList)(s);console.log("Policies response:",e),e.policies&&(console.log("Policies data:",e.policies),u(e.policies))}catch(e){console.error("Error fetching policies:",e)}finally{d(!1)}}})()},[s]),(0,t.jsx)("div",{children:(0,t.jsx)(r.Select,{mode:"multiple",disabled:l,placeholder:l?"Setting policies is a premium feature.":"Select policies",onChange:t=>{console.log("Selected policies:",t),e(t)},value:n,loading:p,className:a,allowClear:!0,options:c.map(e=>(console.log("Mapping policy:",e),{label:`${e.policy_name}${e.description?` - ${e.description}`:""}`,value:e.policy_name})),optionFilterProp:"label",showSearch:!0,style:{width:"100%"}})})}])},689020,e=>{"use strict";var t=e.i(764205);let i=async e=>{try{let i=await (0,t.modelHubCall)(e);if(console.log("model_info:",i),i?.data.length>0){let e=i.data.map(e=>({model_group:e.model_group,mode:e?.mode}));return e.sort((e,t)=>e.model_group.localeCompare(t.model_group)),e}return[]}catch(e){throw console.error("Error fetching model info:",e),e}};e.s(["fetchAvailableModels",0,i])},983561,e=>{"use strict";e.i(247167);var t=e.i(931067),i=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M300 328a60 60 0 10120 0 60 60 0 10-120 0zM852 64H172c-17.7 0-32 14.3-32 32v660c0 17.7 14.3 32 32 32h680c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-32 660H204V128h616v596zM604 328a60 60 0 10120 0 60 60 0 10-120 0zm250.2 556H169.8c-16.5 0-29.8 14.3-29.8 32v36c0 4.4 3.3 8 7.4 8h729.1c4.1 0 7.4-3.6 7.4-8v-36c.1-17.7-13.2-32-29.7-32zM664 508H360c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h304c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"}}]},name:"robot",theme:"outlined"};var o=e.i(9583),n=i.forwardRef(function(e,n){return i.createElement(o.default,(0,t.default)({},e,{ref:n,icon:r}))});e.s(["RobotOutlined",0,n],983561)},916940,e=>{"use strict";var t=e.i(843476),i=e.i(271645),r=e.i(199133),o=e.i(764205);e.s(["default",0,({onChange:e,value:n,className:a,accessToken:s,placeholder:l="Select vector stores",disabled:c=!1})=>{let[u,p]=(0,i.useState)([]),[d,m]=(0,i.useState)(!1);return(0,i.useEffect)(()=>{(async()=>{if(s){m(!0);try{let e=await (0,o.vectorStoreListCall)(s);e.data&&p(e.data)}catch(e){console.error("Error fetching vector stores:",e)}finally{m(!1)}}})()},[s]),(0,t.jsx)("div",{children:(0,t.jsx)(r.Select,{mode:"multiple",placeholder:l,onChange:e,value:n,loading:d,className:a,allowClear:!0,options:u.map(e=>({label:`${e.vector_store_name||e.vector_store_id} (${e.vector_store_id})`,value:e.vector_store_id,title:e.vector_store_description||e.vector_store_id})),optionFilterProp:"label",showSearch:!0,style:{width:"100%"},disabled:c})})}])},955135,e=>{"use strict";var t=e.i(597440);e.s(["DeleteOutlined",()=>t.default])},309821,e=>{"use strict";e.i(247167);var t=e.i(271645);e.i(262370);var i=e.i(135551),r=e.i(201072),o=e.i(121229),n=e.i(726289),a=e.i(864517),s=e.i(343794),l=e.i(529681),c=e.i(242064),u=e.i(931067),p=e.i(209428),d=e.i(703923),m={percent:0,prefixCls:"rc-progress",strokeColor:"#2db7f5",strokeLinecap:"round",strokeWidth:1,trailColor:"#D9D9D9",trailWidth:1,gapPosition:"bottom"},g=function(){var e=(0,t.useRef)([]),i=(0,t.useRef)(null);return(0,t.useEffect)(function(){var t=Date.now(),r=!1;e.current.forEach(function(e){if(e){r=!0;var o=e.style;o.transitionDuration=".3s, .3s, .3s, .06s",i.current&&t-i.current<100&&(o.transitionDuration="0s, 0s")}}),r&&(i.current=Date.now())}),e.current},f=e.i(410160),h=e.i(392221),_=e.i(654310),v=0,y=(0,_.default)();let b=function(e){var i=t.useState(),r=(0,h.default)(i,2),o=r[0],n=r[1];return t.useEffect(function(){var e;n("rc_progress_".concat((y?(e=v,v+=1):e="TEST_OR_SSR",e)))},[]),e||o};var S=function(e){var i=e.bg,r=e.children;return t.createElement("div",{style:{width:"100%",height:"100%",background:i}},r)};function x(e,t){return Object.keys(e).map(function(i){var r=parseFloat(i),o="".concat(Math.floor(r*t),"%");return"".concat(e[i]," ").concat(o)})}var w=t.forwardRef(function(e,i){var r=e.prefixCls,o=e.color,n=e.gradientId,a=e.radius,s=e.style,l=e.ptg,c=e.strokeLinecap,u=e.strokeWidth,p=e.size,d=e.gapDegree,m=o&&"object"===(0,f.default)(o),g=p/2,h=t.createElement("circle",{className:"".concat(r,"-circle-path"),r:a,cx:g,cy:g,stroke:m?"#FFF":void 0,strokeLinecap:c,strokeWidth:u,opacity:+(0!==l),style:s,ref:i});if(!m)return h;var _="".concat(n,"-conic"),v=x(o,(360-d)/360),y=x(o,1),b="conic-gradient(from ".concat(d?"".concat(180+d/2,"deg"):"0deg",", ").concat(v.join(", "),")"),w="linear-gradient(to ".concat(d?"bottom":"top",", ").concat(y.join(", "),")");return t.createElement(t.Fragment,null,t.createElement("mask",{id:_},h),t.createElement("foreignObject",{x:0,y:0,width:p,height:p,mask:"url(#".concat(_,")")},t.createElement(S,{bg:w},t.createElement(S,{bg:b}))))}),$=function(e,t,i,r,o,n,a,s,l,c){var u=arguments.length>10&&void 0!==arguments[10]?arguments[10]:0,p=(100-r)/100*t;return"round"===l&&100!==r&&(p+=c/2)>=t&&(p=t-.01),{stroke:"string"==typeof s?s:void 0,strokeDasharray:"".concat(t,"px ").concat(e),strokeDashoffset:p+u,transform:"rotate(".concat(o+i/100*360*((360-n)/360)+(0===n?0:({bottom:0,top:180,left:90,right:-90})[a]),"deg)"),transformOrigin:"".concat(50,"px ").concat(50,"px"),transition:"stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, stroke .3s, stroke-width .06s ease .3s, opacity .3s ease 0s",fillOpacity:0}},C=["id","prefixCls","steps","strokeWidth","trailWidth","gapDegree","gapPosition","trailColor","strokeLinecap","style","className","strokeColor","percent"];function E(e){var t=null!=e?e:[];return Array.isArray(t)?t:[t]}let O=function(e){var i,r,o,n,a=(0,p.default)((0,p.default)({},m),e),l=a.id,c=a.prefixCls,h=a.steps,_=a.strokeWidth,v=a.trailWidth,y=a.gapDegree,S=void 0===y?0:y,x=a.gapPosition,O=a.trailColor,k=a.strokeLinecap,j=a.style,I=a.className,R=a.strokeColor,z=a.percent,A=(0,d.default)(a,C),N=b(l),P="".concat(N,"-gradient"),T=50-_/2,M=2*Math.PI*T,F=S>0?90+S/2:-90,D=(360-S)/360*M,L="object"===(0,f.default)(h)?h:{count:h,gap:2},H=L.count,B=L.gap,W=E(z),V=E(R),G=V.find(function(e){return e&&"object"===(0,f.default)(e)}),X=G&&"object"===(0,f.default)(G)?"butt":k,q=$(M,D,0,100,F,S,x,O,X,_),U=g();return t.createElement("svg",(0,u.default)({className:(0,s.default)("".concat(c,"-circle"),I),viewBox:"0 0 ".concat(100," ").concat(100),style:j,id:l,role:"presentation"},A),!H&&t.createElement("circle",{className:"".concat(c,"-circle-trail"),r:T,cx:50,cy:50,stroke:O,strokeLinecap:X,strokeWidth:v||_,style:q}),H?(i=Math.round(H*(W[0]/100)),r=100/H,o=0,Array(H).fill(null).map(function(e,n){var a=n<=i-1?V[0]:O,s=a&&"object"===(0,f.default)(a)?"url(#".concat(P,")"):void 0,l=$(M,D,o,r,F,S,x,a,"butt",_,B);return o+=(D-l.strokeDashoffset+B)*100/D,t.createElement("circle",{key:n,className:"".concat(c,"-circle-path"),r:T,cx:50,cy:50,stroke:s,strokeWidth:_,opacity:1,style:l,ref:function(e){U[n]=e}})})):(n=0,W.map(function(e,i){var r=V[i]||V[V.length-1],o=$(M,D,n,e,F,S,x,r,X,_);return n+=e,t.createElement(w,{key:i,color:r,ptg:e,radius:T,prefixCls:c,gradientId:P,style:o,strokeLinecap:X,strokeWidth:_,gapDegree:S,ref:function(e){U[i]=e},size:100})}).reverse()))};var k=e.i(491816);e.i(765846);var j=e.i(896091);function I(e){return!e||e<0?0:e>100?100:e}function R({success:e,successPercent:t}){let i=t;return e&&"progress"in e&&(i=e.progress),e&&"percent"in e&&(i=e.percent),i}let z=(e,t,i)=>{var r,o,n,a;let s=-1,l=-1;if("step"===t){let t=i.steps,r=i.strokeWidth;"string"==typeof e||void 0===e?(s="small"===e?2:14,l=null!=r?r:8):"number"==typeof e?[s,l]=[e,e]:[s=14,l=8]=Array.isArray(e)?e:[e.width,e.height],s*=t}else if("line"===t){let t=null==i?void 0:i.strokeWidth;"string"==typeof e||void 0===e?l=t||("small"===e?6:8):"number"==typeof e?[s,l]=[e,e]:[s=-1,l=8]=Array.isArray(e)?e:[e.width,e.height]}else("circle"===t||"dashboard"===t)&&("string"==typeof e||void 0===e?[s,l]="small"===e?[60,60]:[120,120]:"number"==typeof e?[s,l]=[e,e]:Array.isArray(e)&&(s=null!=(o=null!=(r=e[0])?r:e[1])?o:120,l=null!=(a=null!=(n=e[0])?n:e[1])?a:120));return[s,l]},A=e=>{let{prefixCls:i,trailColor:r=null,strokeLinecap:o="round",gapPosition:n,gapDegree:a,width:l=120,type:c,children:u,success:p,size:d=l,steps:m}=e,[g,f]=z(d,"circle"),{strokeWidth:h}=e;void 0===h&&(h=Math.max(3/g*100,6));let _=t.useMemo(()=>a||0===a?a:"dashboard"===c?75:void 0,[a,c]),v=(({percent:e,success:t,successPercent:i})=>{let r=I(R({success:t,successPercent:i}));return[r,I(I(e)-r)]})(e),y="[object Object]"===Object.prototype.toString.call(e.strokeColor),b=(({success:e={},strokeColor:t})=>{let{strokeColor:i}=e;return[i||j.presetPrimaryColors.green,t||null]})({success:p,strokeColor:e.strokeColor}),S=(0,s.default)(`${i}-inner`,{[`${i}-circle-gradient`]:y}),x=t.createElement(O,{steps:m,percent:m?v[1]:v,strokeWidth:h,trailWidth:h,strokeColor:m?b[1]:b,strokeLinecap:o,trailColor:r,prefixCls:i,gapDegree:_,gapPosition:n||"dashboard"===c&&"bottom"||void 0}),w=g<=20,$=t.createElement("div",{className:S,style:{width:g,height:f,fontSize:.15*g+6}},x,!w&&u);return w?t.createElement(k.default,{title:u},$):$};e.i(296059);var N=e.i(694758),P=e.i(915654),T=e.i(183293),M=e.i(246422),F=e.i(838378);let D="--progress-line-stroke-color",L="--progress-percent",H=e=>{let t=e?"100%":"-100%";return new N.Keyframes(`antProgress${e?"RTL":"LTR"}Active`,{"0%":{transform:`translateX(${t}) scaleX(0)`,opacity:.1},"20%":{transform:`translateX(${t}) scaleX(0)`,opacity:.5},to:{transform:"translateX(0) scaleX(1)",opacity:0}})},B=(0,M.genStyleHooks)("Progress",e=>{let t=e.calc(e.marginXXS).div(2).equal(),i=(0,F.mergeToken)(e,{progressStepMarginInlineEnd:t,progressStepMinWidth:t,progressActiveMotionDuration:"2.4s"});return[(e=>{let{componentCls:t,iconCls:i}=e;return{[t]:Object.assign(Object.assign({},(0,T.resetComponent)(e)),{display:"inline-block","&-rtl":{direction:"rtl"},"&-line":{position:"relative",width:"100%",fontSize:e.fontSize},[`${t}-outer`]:{display:"inline-flex",alignItems:"center",width:"100%"},[`${t}-inner`]:{position:"relative",display:"inline-block",width:"100%",flex:1,overflow:"hidden",verticalAlign:"middle",backgroundColor:e.remainingColor,borderRadius:e.lineBorderRadius},[`${t}-inner:not(${t}-circle-gradient)`]:{[`${t}-circle-path`]:{stroke:e.defaultColor}},[`${t}-success-bg, ${t}-bg`]:{position:"relative",background:e.defaultColor,borderRadius:e.lineBorderRadius,transition:`all ${e.motionDurationSlow} ${e.motionEaseInOutCirc}`},[`${t}-layout-bottom`]:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",[`${t}-text`]:{width:"max-content",marginInlineStart:0,marginTop:e.marginXXS}},[`${t}-bg`]:{overflow:"hidden","&::after":{content:'""',background:{_multi_value_:!0,value:["inherit",`var(${D})`]},height:"100%",width:`calc(1 / var(${L}) * 100%)`,display:"block"},[`&${t}-bg-inner`]:{minWidth:"max-content","&::after":{content:"none"},[`${t}-text-inner`]:{color:e.colorWhite,[`&${t}-text-bright`]:{color:"rgba(0, 0, 0, 0.45)"}}}},[`${t}-success-bg`]:{position:"absolute",insetBlockStart:0,insetInlineStart:0,backgroundColor:e.colorSuccess},[`${t}-text`]:{display:"inline-block",marginInlineStart:e.marginXS,color:e.colorText,lineHeight:1,width:"2em",whiteSpace:"nowrap",textAlign:"start",verticalAlign:"middle",wordBreak:"normal",[i]:{fontSize:e.fontSize},[`&${t}-text-outer`]:{width:"max-content"},[`&${t}-text-outer${t}-text-start`]:{width:"max-content",marginInlineStart:0,marginInlineEnd:e.marginXS}},[`${t}-text-inner`]:{display:"flex",justifyContent:"center",alignItems:"center",width:"100%",height:"100%",marginInlineStart:0,padding:`0 ${(0,P.unit)(e.paddingXXS)}`,[`&${t}-text-start`]:{justifyContent:"start"},[`&${t}-text-end`]:{justifyContent:"end"}},[`&${t}-status-active`]:{[`${t}-bg::before`]:{position:"absolute",inset:0,backgroundColor:e.colorBgContainer,borderRadius:e.lineBorderRadius,opacity:0,animationName:H(),animationDuration:e.progressActiveMotionDuration,animationTimingFunction:e.motionEaseOutQuint,animationIterationCount:"infinite",content:'""'}},[`&${t}-rtl${t}-status-active`]:{[`${t}-bg::before`]:{animationName:H(!0)}},[`&${t}-status-exception`]:{[`${t}-bg`]:{backgroundColor:e.colorError},[`${t}-text`]:{color:e.colorError}},[`&${t}-status-exception ${t}-inner:not(${t}-circle-gradient)`]:{[`${t}-circle-path`]:{stroke:e.colorError}},[`&${t}-status-success`]:{[`${t}-bg`]:{backgroundColor:e.colorSuccess},[`${t}-text`]:{color:e.colorSuccess}},[`&${t}-status-success ${t}-inner:not(${t}-circle-gradient)`]:{[`${t}-circle-path`]:{stroke:e.colorSuccess}}})}})(i),(e=>{let{componentCls:t,iconCls:i}=e;return{[t]:{[`${t}-circle-trail`]:{stroke:e.remainingColor},[`&${t}-circle ${t}-inner`]:{position:"relative",lineHeight:1,backgroundColor:"transparent"},[`&${t}-circle ${t}-text`]:{position:"absolute",insetBlockStart:"50%",insetInlineStart:0,width:"100%",margin:0,padding:0,color:e.circleTextColor,fontSize:e.circleTextFontSize,lineHeight:1,whiteSpace:"normal",textAlign:"center",transform:"translateY(-50%)",[i]:{fontSize:e.circleIconFontSize}},[`${t}-circle&-status-exception`]:{[`${t}-text`]:{color:e.colorError}},[`${t}-circle&-status-success`]:{[`${t}-text`]:{color:e.colorSuccess}}},[`${t}-inline-circle`]:{lineHeight:1,[`${t}-inner`]:{verticalAlign:"bottom"}}}})(i),(e=>{let{componentCls:t}=e;return{[t]:{[`${t}-steps`]:{display:"inline-block","&-outer":{display:"flex",flexDirection:"row",alignItems:"center"},"&-item":{flexShrink:0,minWidth:e.progressStepMinWidth,marginInlineEnd:e.progressStepMarginInlineEnd,backgroundColor:e.remainingColor,transition:`all ${e.motionDurationSlow}`,"&-active":{backgroundColor:e.defaultColor}}}}}})(i),(e=>{let{componentCls:t,iconCls:i}=e;return{[t]:{[`${t}-small&-line, ${t}-small&-line ${t}-text ${i}`]:{fontSize:e.fontSizeSM}}}})(i)]},e=>({circleTextColor:e.colorText,defaultColor:e.colorInfo,remainingColor:e.colorFillSecondary,lineBorderRadius:100,circleTextFontSize:"1em",circleIconFontSize:`${e.fontSize/e.fontSizeSM}em`}));var W=function(e,t){var i={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&0>t.indexOf(r)&&(i[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var o=0,r=Object.getOwnPropertySymbols(e);o<r.length;o++)0>t.indexOf(r[o])&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(i[r[o]]=e[r[o]]);return i};let V=e=>{let{prefixCls:i,direction:r,percent:o,size:n,strokeWidth:a,strokeColor:l,strokeLinecap:c="round",children:u,trailColor:p=null,percentPosition:d,success:m}=e,{align:g,type:f}=d,h=l&&"string"!=typeof l?((e,t)=>{let{from:i=j.presetPrimaryColors.blue,to:r=j.presetPrimaryColors.blue,direction:o="rtl"===t?"to left":"to right"}=e,n=W(e,["from","to","direction"]);if(0!==Object.keys(n).length){let e,t=(e=[],Object.keys(n).forEach(t=>{let i=Number.parseFloat(t.replace(/%/g,""));Number.isNaN(i)||e.push({key:i,value:n[t]})}),(e=e.sort((e,t)=>e.key-t.key)).map(({key:e,value:t})=>`${t} ${e}%`).join(", ")),i=`linear-gradient(${o}, ${t})`;return{background:i,[D]:i}}let a=`linear-gradient(${o}, ${i}, ${r})`;return{background:a,[D]:a}})(l,r):{[D]:l,background:l},_="square"===c||"butt"===c?0:void 0,[v,y]=z(null!=n?n:[-1,a||("small"===n?6:8)],"line",{strokeWidth:a}),b=Object.assign(Object.assign({width:`${I(o)}%`,height:y,borderRadius:_},h),{[L]:I(o)/100}),S=R(e),x={width:`${I(S)}%`,height:y,borderRadius:_,backgroundColor:null==m?void 0:m.strokeColor},w=t.createElement("div",{className:`${i}-inner`,style:{backgroundColor:p||void 0,borderRadius:_}},t.createElement("div",{className:(0,s.default)(`${i}-bg`,`${i}-bg-${f}`),style:b},"inner"===f&&u),void 0!==S&&t.createElement("div",{className:`${i}-success-bg`,style:x})),$="outer"===f&&"start"===g,C="outer"===f&&"end"===g;return"outer"===f&&"center"===g?t.createElement("div",{className:`${i}-layout-bottom`},w,u):t.createElement("div",{className:`${i}-outer`,style:{width:v<0?"100%":v}},$&&u,w,C&&u)},G=e=>{let{size:i,steps:r,rounding:o=Math.round,percent:n=0,strokeWidth:a=8,strokeColor:l,trailColor:c=null,prefixCls:u,children:p}=e,d=o(n/100*r),[m,g]=z(null!=i?i:["small"===i?2:14,a],"step",{steps:r,strokeWidth:a}),f=m/r,h=Array.from({length:r});for(let e=0;e<r;e++){let i=Array.isArray(l)?l[e]:l;h[e]=t.createElement("div",{key:e,className:(0,s.default)(`${u}-steps-item`,{[`${u}-steps-item-active`]:e<=d-1}),style:{backgroundColor:e<=d-1?i:c,width:f,height:g}})}return t.createElement("div",{className:`${u}-steps-outer`},h,p)};var X=function(e,t){var i={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&0>t.indexOf(r)&&(i[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var o=0,r=Object.getOwnPropertySymbols(e);o<r.length;o++)0>t.indexOf(r[o])&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(i[r[o]]=e[r[o]]);return i};let q=["normal","exception","active","success"],U=t.forwardRef((e,u)=>{let p,{prefixCls:d,className:m,rootClassName:g,steps:f,strokeColor:h,percent:_=0,size:v="default",showInfo:y=!0,type:b="line",status:S,format:x,style:w,percentPosition:$={}}=e,C=X(e,["prefixCls","className","rootClassName","steps","strokeColor","percent","size","showInfo","type","status","format","style","percentPosition"]),{align:E="end",type:O="outer"}=$,k=Array.isArray(h)?h[0]:h,j="string"==typeof h||Array.isArray(h)?h:void 0,N=t.useMemo(()=>{if(k){let e="string"==typeof k?k:Object.values(k)[0];return new i.FastColor(e).isLight()}return!1},[h]),P=t.useMemo(()=>{var t,i;let r=R(e);return Number.parseInt(void 0!==r?null==(t=null!=r?r:0)?void 0:t.toString():null==(i=null!=_?_:0)?void 0:i.toString(),10)},[_,e.success,e.successPercent]),T=t.useMemo(()=>!q.includes(S)&&P>=100?"success":S||"normal",[S,P]),{getPrefixCls:M,direction:F,progress:D}=t.useContext(c.ConfigContext),L=M("progress",d),[H,W,U]=B(L),Y="line"===b,K=Y&&!f,J=t.useMemo(()=>{let i;if(!y)return null;let l=R(e),c=x||(e=>`${e}%`),u=Y&&N&&"inner"===O;return"inner"===O||x||"exception"!==T&&"success"!==T?i=c(I(_),I(l)):"exception"===T?i=Y?t.createElement(n.default,null):t.createElement(a.default,null):"success"===T&&(i=Y?t.createElement(r.default,null):t.createElement(o.default,null)),t.createElement("span",{className:(0,s.default)(`${L}-text`,{[`${L}-text-bright`]:u,[`${L}-text-${E}`]:K,[`${L}-text-${O}`]:K}),title:"string"==typeof i?i:void 0},i)},[y,_,P,T,b,L,x]);"line"===b?p=f?t.createElement(G,Object.assign({},e,{strokeColor:j,prefixCls:L,steps:"object"==typeof f?f.count:f}),J):t.createElement(V,Object.assign({},e,{strokeColor:k,prefixCls:L,direction:F,percentPosition:{align:E,type:O}}),J):("circle"===b||"dashboard"===b)&&(p=t.createElement(A,Object.assign({},e,{strokeColor:k,prefixCls:L,progressStatus:T}),J));let Q=(0,s.default)(L,`${L}-status-${T}`,{[`${L}-${"dashboard"===b&&"circle"||b}`]:"line"!==b,[`${L}-inline-circle`]:"circle"===b&&z(v,"circle")[0]<=20,[`${L}-line`]:K,[`${L}-line-align-${E}`]:K,[`${L}-line-position-${O}`]:K,[`${L}-steps`]:f,[`${L}-show-info`]:y,[`${L}-${v}`]:"string"==typeof v,[`${L}-rtl`]:"rtl"===F},null==D?void 0:D.className,m,g,W,U);return H(t.createElement("div",Object.assign({ref:u,style:Object.assign(Object.assign({},null==D?void 0:D.style),w),className:Q,role:"progressbar","aria-valuenow":P,"aria-valuemin":0,"aria-valuemax":100},(0,l.default)(C,["trailColor","strokeWidth","width","gapDegree","gapPosition","strokeLinecap","success","successPercent"])),p))});e.s(["default",0,U],309821)},597440,e=>{"use strict";e.i(247167);var t=e.i(931067),i=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"}}]},name:"delete",theme:"outlined"};var o=e.i(9583),n=i.forwardRef(function(e,n){return i.createElement(o.default,(0,t.default)({},e,{ref:n,icon:r}))});e.s(["default",0,n],597440)},737434,e=>{"use strict";var t=e.i(184163);e.s(["DownloadOutlined",()=>t.default])},891547,e=>{"use strict";var t=e.i(843476),i=e.i(271645),r=e.i(199133),o=e.i(764205);e.s(["default",0,({onChange:e,value:n,className:a,accessToken:s,disabled:l})=>{let[c,u]=(0,i.useState)([]),[p,d]=(0,i.useState)(!1);return(0,i.useEffect)(()=>{(async()=>{if(s){d(!0);try{let e=await (0,o.getGuardrailsList)(s);console.log("Guardrails response:",e),e.guardrails&&(console.log("Guardrails data:",e.guardrails),u(e.guardrails))}catch(e){console.error("Error fetching guardrails:",e)}finally{d(!1)}}})()},[s]),(0,t.jsx)("div",{children:(0,t.jsx)(r.Select,{mode:"multiple",disabled:l,placeholder:l?"Setting guardrails is a premium feature.":"Select guardrails",onChange:t=>{console.log("Selected guardrails:",t),e(t)},value:n,loading:p,className:a,allowClear:!0,options:c.map(e=>(console.log("Mapping guardrail:",e),{label:`${e.guardrail_name}`,value:e.guardrail_name})),optionFilterProp:"label",showSearch:!0,style:{width:"100%"}})})}])},596239,e=>{"use strict";e.i(247167);var t=e.i(931067),i=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M574 665.4a8.03 8.03 0 00-11.3 0L446.5 781.6c-53.8 53.8-144.6 59.5-204 0-59.5-59.5-53.8-150.2 0-204l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3l-39.8-39.8a8.03 8.03 0 00-11.3 0L191.4 526.5c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3L574 665.4zm258.6-474c-84.6-84.6-221.5-84.6-306 0L410.3 307.6a8.03 8.03 0 000 11.3l39.7 39.7c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c53.8-53.8 144.6-59.5 204 0 59.5 59.5 53.8 150.2 0 204L665.3 562.6a8.03 8.03 0 000 11.3l39.8 39.8c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c84.5-84.6 84.5-221.5 0-306.1zM610.1 372.3a8.03 8.03 0 00-11.3 0L372.3 598.7a8.03 8.03 0 000 11.3l39.6 39.6c3.1 3.1 8.2 3.1 11.3 0l226.4-226.4c3.1-3.1 3.1-8.2 0-11.3l-39.5-39.6z"}}]},name:"link",theme:"outlined"};var o=e.i(9583),n=i.forwardRef(function(e,n){return i.createElement(o.default,(0,t.default)({},e,{ref:n,icon:r}))});e.s(["LinkOutlined",0,n],596239)},166406,e=>{"use strict";var t=e.i(190144);e.s(["CopyOutlined",()=>t.default])},240647,e=>{"use strict";var t=e.i(286612);e.s(["RightOutlined",()=>t.default])},362024,e=>{"use strict";var t=e.i(988122);e.s(["Collapse",()=>t.default])},637235,e=>{"use strict";e.i(247167);var t=e.i(931067),i=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"}},{tag:"path",attrs:{d:"M686.7 638.6L544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.6 2.6 8.6 1.8 11.2-1.7l28.6-39c2.6-3.7 1.8-8.7-1.8-11.2z"}}]},name:"clock-circle",theme:"outlined"};var o=e.i(9583),n=i.forwardRef(function(e,n){return i.createElement(o.default,(0,t.default)({},e,{ref:n,icon:r}))});e.s(["ClockCircleOutlined",0,n],637235)},245704,e=>{"use strict";e.i(247167);var t=e.i(931067),i=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M699 353h-46.9c-10.2 0-19.9 4.9-25.9 13.3L469 584.3l-71.2-98.8c-6-8.3-15.6-13.3-25.9-13.3H325c-6.5 0-10.3 7.4-6.5 12.7l124.6 172.8a31.8 31.8 0 0051.7 0l210.6-292c3.9-5.3.1-12.7-6.4-12.7z"}},{tag:"path",attrs:{d:"M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"}}]},name:"check-circle",theme:"outlined"};var o=e.i(9583),n=i.forwardRef(function(e,n){return i.createElement(o.default,(0,t.default)({},e,{ref:n,icon:r}))});e.s(["CheckCircleOutlined",0,n],245704)},245094,e=>{"use strict";e.i(247167);var t=e.i(931067),i=e.i(271645);let r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M516 673c0 4.4 3.4 8 7.5 8h185c4.1 0 7.5-3.6 7.5-8v-48c0-4.4-3.4-8-7.5-8h-185c-4.1 0-7.5 3.6-7.5 8v48zm-194.9 6.1l192-161c3.8-3.2 3.8-9.1 0-12.3l-192-160.9A7.95 7.95 0 00308 351v62.7c0 2.4 1 4.6 2.9 6.1L420.7 512l-109.8 92.2a8.1 8.1 0 00-2.9 6.1V673c0 6.8 7.9 10.5 13.1 6.1zM880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"}}]},name:"code",theme:"outlined"};var o=e.i(9583),n=i.forwardRef(function(e,n){return i.createElement(o.default,(0,t.default)({},e,{ref:n,icon:r}))});e.s(["CodeOutlined",0,n],245094)}]);