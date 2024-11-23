    import Groq from "groq-sdk";

   
    const groqClient = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,  
    dangerouslyAllowBrowser: true,
    });

    
    export const generateInsights = async (content) => {
    try {
      
        if (!content || content.trim() === "") {
        throw new Error("No content provided for analysis.");
        }

       

        const response = await groqClient.chat.completions.create({
        messages: [
            {
            role: "user",
            content: `Analyze the following text and provide a summary, themes, and keywords: "${content}"`,
            },
        ],
        model: "llama3-8b-8192", 
        });

      
        console.log("Groq API Response:", response);

        
        const responseData = response.choices?.[0]?.message?.content || {};
        console.log(responseData);
        console.log(typeof responseData);

        const insight = {
            Summary: responseData.match(/\*\*Summary:\*\*(.*?)\*\*Themes:/s)[1].trim(),
            Themes: responseData.match(/\*\*Themes:\*\*(.*?)\*\*Keywords:/s)[1].trim().split('\n').map(line => line.trim()).filter(line => line),
            Keywords: responseData.match(/\*\*Keywords:\*\*(.*)/s)[1].trim().split('\n').map(line => line.replace(/^\d+\.\s\*\*/, '').replace(/\*\*$/, '').trim()).filter(line => line)
        };


    return {
    summary: insight.Summary || "No summary generated.",
    themes: insight.Themes || "No themes found.",
    keywords: insight.Keywords || "No keywords detected.",
    };

    } catch (error) {
        console.error("Error with Groq AI:", error);
        throw new Error("Failed to generate insights. Please try again.");
    }
    };
