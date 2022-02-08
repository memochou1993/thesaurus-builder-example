const app = document.querySelector('#app');
const spinner = document.querySelector('#spinner');
const title = document.querySelector('#title');
const input = document.querySelector('#input');
const root = document.querySelector('#root');
const subjectTemplate = document.querySelector('[data-subject-template]');
const termTemplate = document.querySelector('[data-term-template]');
const noteTemplate = document.querySelector('[data-note-template]');

/**
 * @param {HTMLElement} target
 * @param {Object} prop
 * @param {Object} prop.subject
 * @param {Object} prop.subject.terms
 * @param {Array}  prop.subject.terms[].text
 * @param {Array}  prop.subject.terms[].preferred
 * @param {Object} prop.subject.notes
 * @param {string} prop.subject.notes[].text
 * @param {Array}  prop.children
 */
const render = (target, prop) => {
  const [subject] = subjectTemplate.content.cloneNode(true).children;
  const [preferredTerm, notes, terms, children] = subject.children;
  prop.subject.terms.forEach((item) => {
    if (item.preferred) {
      preferredTerm.textContent = item.text;
      preferredTerm.classList.add(prop?.children?.length ? 'preferred-term-expandable' : 'preferred-term-expanded');
   }
    const [term] = termTemplate.content.cloneNode(true).children;
    const [text] = term.children;
    text.textContent = item.preferred ? `${item.text} (preferred)` : item.text;
    terms.appendChild(term);
  });
  prop.subject.notes?.forEach((item) => {
    const [note] = noteTemplate.content.cloneNode(true).children;
    const [text] = note.children;
    text.textContent = item.text;
    notes.append(note);
  });
  target.appendChild(subject);
  setTimeout(() => prop?.children?.forEach((item) => render(children, item)), 0);
};

const search = (prop, input) => {
  const subjects = [];
  const terms = prop.subject.terms.filter((item) => {
    if (item.text === input) {
      return true;
    }
    return item.text.includes(input);
  });
  if (terms.length > 0) {
    subjects.push(prop);
  }
  for (let i = 0; i < prop?.children?.length; i++) {
    if (subjects.length > 50) {
      break;
    }
    search(prop?.children[i], input).forEach((item) => subjects.push(item));
  }
  return subjects;
};

const toggleSpinner = async (delay = 0) => {
  await new Promise((res) => setTimeout(() => res(), delay));
  document.documentElement.classList.toggle('full-height');
  spinner.classList.toggle('hidden');
  app.classList.toggle('hidden');
};

let data;

(async () => {
  await toggleSpinner();
  data = await fetch('data.json').then((r) => r.json());
  title.textContent = data.title;
  render(root, data.root);
  await toggleSpinner(1000);
})();

root.addEventListener('click', (e) => {
  if (e.target.classList.contains('preferred-term-expandable')) {
    e.target.parentElement.querySelector('.children').classList.toggle('hidden');
    e.target.classList.toggle('preferred-term-expanded');
  }
});

input.addEventListener('keyup', (e) => {
  root.innerHTML = '';
  if (input.value.trim().length > 1) {
    search(data.root, input.value).forEach((item) => render(root, item));
    return;
  }
  render(root, data.root);
});
