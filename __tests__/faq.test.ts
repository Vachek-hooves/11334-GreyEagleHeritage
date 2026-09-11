import { answerQuestion, faq } from '../src/data/faq';
import glossary from '../src/data/glossary.json';
import places from '../src/data/places.json';
import stories from '../src/data/stories.json';
test('answers supplied questions and does not invent unknown policies', () => {
  expect(answerQuestion('Is parking available?')).toBe(
    faq.find(item => item.q === 'Is parking available?')?.a,
  );
  expect(answerQuestion('What time is check-out?')).toContain(
    'could not find a reliable answer',
  );
  expect(answerQuestion('wifi')).toContain('High-speed Wi-Fi');
});
test('all supplied cultural entries are present with unique identifiers', () => {
  expect(glossary).toHaveLength(40);
  expect(stories).toHaveLength(32);
  expect(places).toHaveLength(9);
  const entries = [...glossary, ...stories, ...places];
  expect(new Set(entries.map(item => item.id)).size).toBe(entries.length);
  expect(
    places.every(
      item => item.latitude > 50 && item.latitude < 52 && item.longitude < -114,
    ),
  ).toBe(true);
});

test('expanded suggestions have unique questions and return their own answers', () => {
  expect(faq.length).toBeGreaterThanOrEqual(80);
  expect(new Set(faq.map(item => item.q)).size).toBe(faq.length);
  for (const item of faq) {
    expect(answerQuestion(item.q)).toBe(item.a);
  }
  for (const topic of [
    'Hotel',
    'Heritage',
    'Dining',
    'Entertainment',
    'Explore',
  ]) {
    expect(
      faq.filter(item => item.topic === topic).length,
    ).toBeGreaterThanOrEqual(4);
  }
});
