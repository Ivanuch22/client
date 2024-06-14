export default function removeBodyField(objectsArray:any) {
    return objectsArray.map((obj:any) => {
        const { body, ...rest } = obj.attributes;
        return {
          id:obj.id,
          attributes: rest
        };
    });
}