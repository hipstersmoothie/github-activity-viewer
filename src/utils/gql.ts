/** Just constructs the template string. Used for syntax highlighting in VSCode */
export const gql = (
  staticParts: TemplateStringsArray,
  ...dynamicParts: (string | number)[]
) => {
  const str = [];

  for (let i = 0; i < staticParts.length; i++) {
    str.push(staticParts[i]);

    if (dynamicParts[i]) {
      str.push(dynamicParts[i]);
    }
  }

  return str.join("");
};
