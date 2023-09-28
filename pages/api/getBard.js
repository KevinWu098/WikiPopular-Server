const cors = require("cors");
const { TextServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");

const MODEL_NAME = "models/text-bison-001";
const API_KEY = "AIzaSyCm4XJ52YJr3b0YSYAPAcMHLTbfyiWFP2Q";

const client = new TextServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

const corsMiddleware = cors();

export default function handler(req, res) {
    try {
        corsMiddleware(req, res, () => {
            const articleSummary = req.query.summary;

            const promptString = `${articleSummary} Summarize this paragraph and correct formatting as needed.`;
            const stopSequences = [];

            client
                .generateText({
                    // required, which model to use to generate the result
                    model: MODEL_NAME,
                    // optional, 0.0 always uses the highest-probability result
                    temperature: 0.0,
                    // optional, how many candidate results to generate
                    candidateCount: 1,
                    // optional, number of most probable tokens to consider for generation
                    top_k: 40,
                    // optional, for nucleus sampling decoding strategy
                    top_p: 0.95,
                    // optional, maximum number of output tokens to generate
                    max_output_tokens: 1024,
                    // optional, sequences at which to stop model generation
                    stop_sequences: stopSequences,
                    // optional, safety settings
                    safety_settings: [
                        { category: "HARM_CATEGORY_DEROGATORY", threshold: 4 },
                        { category: "HARM_CATEGORY_TOXICITY", threshold: 4 },
                        { category: "HARM_CATEGORY_VIOLENCE", threshold: 4 },
                        { category: "HARM_CATEGORY_SEXUAL", threshold: 4 },
                        { category: "HARM_CATEGORY_MEDICAL", threshold: 4 },
                        { category: "HARM_CATEGORY_DANGEROUS", threshold: 4 },
                    ],
                    prompt: {
                        text: promptString,
                    },
                })
                .then((result) => {
                    // console.log(result[0].candidates[0].output);
                    res.status(200).send(
                        result[0].candidates[0]?.output ?? "ERROR"
                    );
                });
        });
    } catch (error) {
        res.status(404).send("Error");
    }
}

// const formattedSummary = await aiFormattedSummary(summary);
// return formattedSummary;

// Too inconsistent ** and slow **
// const aiFormattedSummary = async (summary) => {
//   const PALM_API_KEY = "AIzaSyCm4XJ52YJr3b0YSYAPAcMHLTbfyiWFP2Q";
//   const apiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage`;

//   const requestData = {
//     prompt: {
//       context: "Correct the formatting of this Wikipedia lead section: ",
//       examples: [],
//       messages: [{ content: summary }],
//     },
//     temperature: 0.65,
//     top_k: 40,
//     top_p: 0.95,
//     candidate_count: 1,
//   };

//   const headers = {
//     "Content-Type": "application/json",
//   };

//   try {
//     const response = await axios.post(
//       `${apiUrl}?key=${PALM_API_KEY}`,
//       requestData,
//       {
//         headers,
//       }
//     );

//     if (response.status === 200) {
//       if (
//         response.data &&
//         response.data.candidates &&
//         response.data.candidates.length > 0
//       ) {
//         const botResponse = response.data.candidates[0].content;

//         return botResponse;
//       } else {
//         console.error("Response structure is not as expected.");
//       }
//     } else {
//       console.error(
//         "Google Cloud API request failed with status:",
//         response.status
//       );
//     }
//   } catch (error) {
//     console.error(
//       "An error occurred while making the Google Cloud API request:",
//       error
//     );
//   }
// };
