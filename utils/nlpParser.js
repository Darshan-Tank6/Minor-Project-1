const nlp = require("compromise");
const axios = require("axios");

function parseDate(text) {
  const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}([-/]\d{2,4})?)/);
  return dateMatch ? dateMatch[1] : "";
}

async function extractEntities(emailText) {
  try {
    const response = await axios.post(
      "https://nlp-mqgn.onrender.com/extract",
      {
        text: emailText,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Extracted Entities:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error calling FastAPI service:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    return null;
  }
}

function cleanEmailText(parsed) {
  let body = parsed.text || "";

  // Fallback to HTML-to-text if plain text is missing
  if (!body && parsed.html) {
    const { htmlToText } = require("html-to-text");
    body = htmlToText(parsed.html, { wordwrap: false });
  }

  // 1️⃣ Remove corporate disclaimers & common footer markers
  body = body.replace(/Disclaimer[\s\S]*$/gi, "");
  body = body.replace(/please do not\s+print[\s\S]*$/gi, "");
  body = body.replace(/This email.*?viewed at[\s\S]*$/gi, "");
  body = body.replace(/This message.*?confidential[\s\S]*$/gi, "");
  body = body.replace(/From:.*Sent:.*To:.*Subject:.*/gi, "");

  // 2️⃣ Remove quoted reply sections
  body = body.replace(/On .* wrote:/gi, "");
  body = body.replace(/^\s*>.*$/gm, "");

  // 3️⃣ Remove URLs
  body = body.replace(/https?:\/\/\S+/gi, "");

  // 4️⃣ Normalize whitespace & fix line wrapping
  body = body.replace(/\n+/g, " ");
  body = body.replace(/\s{2,}/g, " ");

  // 5️⃣ Trim final output
  return body.trim();
}

module.exports = {
  extractEntities,
  cleanEmailText,
};
