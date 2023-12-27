export function prepareMetadata(token) {
  const media = [];
  const audio = [];
  const attachments = [];
  const texts = [];
  const strings = [];

  //kind: text string image file map
  //name: description image
  //const id = newMedia.length;
  //if (type === "video") newMedia.push({ data: item.media[i], id: id });
  function iterateProperties(properties, level = 0) {
    for (const key in properties) {
      console.log(`key:`, key, properties[key]);
      switch (key) {
        case "description":
          if (level > 0) {
            texts.push({
              key: key,
              data: properties[key].linkedObject.text,
              id: texts.length,
            });
          }
          break;
        case "image":
          if (level > 0) {
            media.push({
              data: properties[key].linkedObject,
              id: media.length,
            });
          }
          break;
        default:
          switch (properties[key].kind) {
            case "text":
              texts.push({
                key: key,
                data: properties[key].linkedObject.text,
                id: texts.length,
              });
              break;
            case "string":
              if (
                token.type === "nft" ||
                (key !== "name" && key !== "time" && key !== "post")
              )
                strings.push({
                  key: key,
                  data: properties[key].data,
                  id: strings.length,
                });
              break;
            case "image":
              media.push({
                data: properties[key].linkedObject,
                id: media.length,
              });
              break;
            case "file":
              switch (
                properties[key].linkedObject.mimeType.replace(/\/[^/.]+$/, "")
              ) {
                case "audio":
                  media.push({
                    data: properties[key].linkedObject,
                    id: audio.length,
                  });
                  break;
                case "video":
                  media.push({
                    data: properties[key].linkedObject,
                    id: media.length,
                  });
                  break;
                case "image":
                  media.push({
                    data: properties[key].linkedObject,
                    id: media.length,
                  });
                  break;
                case "application":
                  if (
                    properties[key].linkedObject.mimeType === "application/pdf"
                  )
                    media.push({
                      data: properties[key].linkedObject,
                      id: media.length,
                    });
                  else
                    attachments.push({
                      data: properties[key].linkedObject,
                      id: attachments.length,
                    });
                  break;
                default:
                  //console.log("default", properties[key].linkedObject);
                  attachments.push({
                    data: properties[key].linkedObject,
                    id: attachments.length,
                  });
                  break;
              }
              break;
            case "map":
              iterateProperties(properties[key].properties, level + 1);
              break;
            default:
              throw new Error(`unknown kind: ${properties[key].kind}`);
          }
      }
    }
  }
  try {
    if (token.type === "nft") {
      const URI = {
        filename: token.name + ".v" + token.version + ".public.json",
        mimeType: "application/json",
        size: 0,
        storage: token.uri,
        type: "file",
      };

      attachments.push({
        data: URI,
        id: attachments.length,
      });
    }
    //const properties = JSON.parse(token.properties);
    iterateProperties(token.properties);
  } catch (error) {
    console.error(`Error: ${error}`);
  }

  return {
    media,
    audio,
    attachments,
    texts,
    strings,
  };
}
