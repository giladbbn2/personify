const template = document.createElement("template");

template.innerHTML = `
  <style>
    div { border: 2px solid red; padding: 1rem; }
  </style>
  <div>404</div>
`;

export const notFoundPageTemplate = template;