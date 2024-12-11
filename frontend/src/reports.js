export const parseChatComponents = (inputText) => {
    const components = {
        system: null,
        user: null,
        assistant: null
    };

    // Expresión regular para capturar los bloques, considerando la ausencia de <|im_end|>
    const matches = inputText.matchAll(/<\|im_start\|>(system|user|assistant)\s*([\s\S]*?)(?=<\|im_start\|>|$)/g);

    for (const match of matches) {
        const key = match[1]; // "system", "user" o "assistant"
        const value = match[2].trim();
        components[key] = value;
    }

    return components;
}


export const parseReportText = (text) => {
    if (!text) return null;

    text = text.replace(/Publ icación/g, "Publicación");
    const lines = text.split("\n");
    const elements = [];

    let listItems = [];
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (/^<|im_start|>system|^<|im_start|>user|^<|im_start|>assistant/i.test(trimmedLine)) {
        elements.push(
          <p key={`section-${index}`} className="font-bold text-gray-800 model-section mb-2">
            {trimmedLine.replace("<|im_start|>", "")}
          </p>
        );
      } else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
        listItems.push(trimmedLine.substring(2));
      } else {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-8 mb-2">
              {listItems.map((item, i) => (
                <li key={`item-${i}`} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          );
          listItems = [];
        }

        if (trimmedLine) {
          elements.push(
            <p key={`line-${index}`} className="text-gray-700 mb-2">
              {trimmedLine}
            </p>
          );
        }
      }
    });

    if (listItems.length > 0) {
      elements.push(
        <ul key="list-final" className="list-disc pl-8 mb-2">
          {listItems.map((item, i) => (
            <li key={`item-final-${i}`} className="text-gray-700">
              {item}
            </li>
          ))}
        </ul>
      );
    }

    return elements;
  };