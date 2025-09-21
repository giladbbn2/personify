const template = document.createElement("template");

template.innerHTML = `
  <style>
    nav { display: flex; gap: 1em; background: #eee; padding: 1em; font-family: Arial; }
    a { text-decoration: none; color: teal; cursor: pointer; }
    a.active { font-weight: bold; text-decoration: underline; }
  </style>
  <nav>
    <a data-page-name="chat" class="active">Chat</a>
    <a data-page-name="about">About</a>
    <a data-route="team">Team</a>
  </nav>
`;

export const headerTemplate = template;