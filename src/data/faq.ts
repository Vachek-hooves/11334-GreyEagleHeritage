import glossary from './glossary.json';
import places from './places.json';
import { rooms } from './rooms';

const resortQuestions = [
  {
    topic: 'Hotel',
    q: 'Where is Grey Eagle Resort & Casino located?',
    a: 'Grey Eagle Resort & Casino is located at 3777 Grey Eagle Drive, Tsuut’ina, Alberta, T3E 3X8, southwest of Calgary. The hotel, Event Centre, dining venues and resort facilities are within the same destination.',
  },
  {
    topic: 'Heritage',
    q: 'Is Grey Eagle located on Tsuut’ina Nation?',
    a: 'Yes. Grey Eagle is located on the lands of the Tsuut’ina Nation. Its cultural experiences introduce visitors to the Nation’s history, culture, traditions and connection to the land.',
  },
  {
    topic: 'Heritage',
    q: 'What can I learn through the Cultural Tours?',
    a: 'Tours may include Tsuut’ina storytelling and history, language and traditions, Indigenous teachings, cultural interpretation, buffalo, Indian Relay and ranch life.',
  },
  {
    topic: 'Heritage',
    q: 'What is included in the Tsuut’ina Museum experience?',
    a: 'Knowledgeable cultural guides introduce visitors to Tsuut’ina culture, storytelling, history, language and traditions.',
  },
  {
    topic: 'Heritage',
    q: 'What is the Buffalo Paddock Tour?',
    a: 'A guided outdoor experience visiting the buffalo herd and exploring its cultural and historical significance and connection to land and tradition.',
  },
  {
    topic: 'Heritage',
    q: 'What is the DH Ranch Indigenous Experience?',
    a: 'Learn about Indian Relay and ranch life, with possible horse interactions, relay demonstrations and meetings with the DH Ranch relay team. Trust, timing and teamwork are central themes.',
  },
  {
    topic: 'Heritage',
    q: 'What is the Brown Bear Woman Events Cultural Experience?',
    a: 'An interactive cultural program focused on Indigenous teachings, storytelling, interpretive experiences, cultural awareness and educational activities.',
  },
  {
    topic: 'Heritage',
    q: 'Can cultural tours be customized?',
    a: 'Yes. Tours are offered by request and can be customized to group size and interests. They are especially suitable for groups of approximately 10–14 people.',
  },
  {
    topic: 'Heritage',
    q: 'How much do Cultural Tours cost?',
    a: 'Pricing is customized to the size of the group and experiences selected. Tour-only and tour-with-add-on options are available.',
  },
  {
    topic: 'Heritage',
    q: 'How can I book a Cultural Tour?',
    a: 'Tours are offered by request, subject to guide and tour scheduling. Send inquiries and booking requests to bustours@greyeagle.ca.',
  },
  {
    topic: 'Dining',
    q: 'Can dining be added to a Cultural Tour?',
    a: 'Yes. Group dining can include an Indigenous-inspired menu at Little Chief Restaurant. Custom group menus may be available on request.',
  },
  {
    topic: 'Hotel',
    q: 'What types of hotel rooms are available?',
    a: 'Standard King, Premier King, Standard Two Queen, King Suite and Presidential Suite. Browse the Stay tab for room details.',
  },
  {
    topic: 'Hotel',
    q: 'Which room is best for up to four guests?',
    a: 'The Standard Two Queen accommodates up to four guests with two queen beds.',
  },
  {
    topic: 'Hotel',
    q: 'What is the largest suite?',
    a: 'The Presidential Suite is the largest listed suite at 875 sq ft, with a separate king bedroom, living and dining areas, wet bar, two bathrooms and three televisions.',
  },
  {
    topic: 'Hotel',
    q: 'Does the hotel have Wi-Fi?',
    a: 'Yes. High-speed Wi-Fi is listed among the amenities for Grey Eagle hotel rooms and suites.',
  },
  {
    topic: 'Hotel',
    q: 'Does the hotel have a fitness centre?',
    a: 'The supplied resort information lists a 24-hour fitness centre for guests.',
  },
  {
    topic: 'Hotel',
    q: 'Is parking available?',
    a: 'Free and secure parking is listed among the resort amenities.',
  },
  {
    topic: 'Hotel',
    q: 'Is there a swimming pool?',
    a: 'The supplied resort information states that the pool is closed for renovations and mentions complimentary access to Killarney and Glenmore Pools through the Front Desk. Please confirm the current arrangement with the hotel.',
  },
  {
    topic: 'Entertainment',
    q: 'What are the Box Office hours?',
    a: 'The supplied schedule lists Wednesday 10:00 AM–2:00 PM, Friday 4:00 PM–8:00 PM and Sunday 10:00 AM–2:00 PM. Confirm current hours with the Box Office before visiting.',
  },
];
export const faq = [
  ...resortQuestions,
  ...rooms.flatMap(room => [
    { topic: 'Hotel', q: `What is the ${room.title} like?`, a: room.body },
    {
      topic: 'Hotel',
      q: `What amenities does the ${room.title} include?`,
      a: `${room.title} accommodates ${room.sleeps} guests with ${
        room.bed
      }. Size: ${room.size}. Amenities include ${room.features.join(', ')}.`,
    },
  ]),
  {
    topic: 'Hotel',
    q: 'How do I request housekeeping?',
    a: 'Open Stay, choose Services, then Housekeeping. Enter your room number, preferred time and any comments. Save your request and share it with the Front Desk to arrange service.',
  },
  {
    topic: 'Hotel',
    q: 'Can I ask for extra towels or pillows?',
    a: 'Yes. Prepare an Extra Towels or Room Amenities request in Stay → Services, enter your room number and describe what you need. Share the saved request with the Front Desk.',
  },
  {
    topic: 'Hotel',
    q: 'How do I cancel a service request?',
    a: 'Open your saved request in Stay → Services and select Cancel request. If you already shared it, contact the Front Desk as well; cancelling in the app updates your local record only.',
  },
  {
    topic: 'Hotel',
    q: 'Can I request accessibility support?',
    a: 'Choose Accessibility in Stay → Services and describe any mobility, hearing or visual support you need. Share the request with the Front Desk to confirm arrangements.',
  },
  {
    topic: 'Dining',
    q: 'What is Little Chief Restaurant?',
    a: 'Little Chief is a restaurant at Grey Eagle Resort & Casino whose culinary concept includes Indigenous influences. Dining there can form part of a cultural-tour experience.',
  },
  {
    topic: 'Dining',
    q: 'Are custom group menus available?',
    a: 'Custom group menus may be available on request. Mention your group’s requirements when inquiring about a cultural tour at bustours@greyeagle.ca.',
  },
  {
    topic: 'Dining',
    q: 'How do I prepare an in-room dining request?',
    a: 'Open Stay → Services → In-Room Dining. Add your room number and preferences, then share the request with the Front Desk. Confirm menu availability and prices directly with the hotel.',
  },
  {
    topic: 'Entertainment',
    q: 'How can I add an event to my plans?',
    a: 'Open Events, select Add a plan and enter the title, date, time, venue and any notes. Your plan is saved on this device.',
  },
  {
    topic: 'Entertainment',
    q: 'Can I edit or delete a saved event?',
    a: 'Open the event from Events or All saved plans. Update the information and tap Save plan, or choose Delete plan and confirm.',
  },
  {
    topic: 'Entertainment',
    q: 'Does saving a plan reserve tickets?',
    a: 'No. A saved plan is a personal reminder. Arrange tickets directly with the venue or Box Office.',
  },
  ...glossary.map(term => ({
    topic: 'Heritage',
    q: `What does “${term.title}” mean?`,
    a: term.body,
  })),
  ...places.map(place => ({
    topic: 'Explore',
    q: `What can I discover at ${place.title}?`,
    a: place.body.replace(/\nHighlights\n/, '\nHighlights:\n'),
  })),
  {
    topic: 'Explore',
    q: 'How do I get directions to a place?',
    a: 'Open Explore, select a place and tap Get directions. The route opens in your phone’s maps app using the place’s coordinates.',
  },
  {
    topic: 'Explore',
    q: 'Where can I find Indigenous-made gifts?',
    a: 'The Tsuut’ina Museum & Gift Shop showcases Indigenous-made clothing, jewellery, moccasins and other works. Open its page in Explore for more information and directions.',
  },
];
const words = (text: string) =>
  text
    .toLowerCase()
    .replace(/wi[ -]?fi/g, 'wifi')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .filter(
      word =>
        word.length > 2 &&
        ![
          'the',
          'what',
          'where',
          'does',
          'can',
          'are',
          'for',
          'and',
          'have',
          'how',
          'there',
          'with',
          'grey',
          'eagle',
        ].includes(word),
    );
export function answerQuestion(question: string) {
  const exact = faq.find(
    item => item.q.toLowerCase() === question.trim().toLowerCase(),
  );
  if (exact) {
    return exact.a;
  }
  const terms = words(question);
  const ranked = faq
    .map(item => ({
      item,
      score: terms.reduce(
        (total, word) =>
          total +
          (words(item.q).includes(word)
            ? 3
            : words(item.a).includes(word)
            ? 1
            : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.score >= 3
    ? ranked[0].item.a
    : 'I could not find a reliable answer in the resort information provided. Please contact the Front Desk. For cultural tour inquiries, email bustours@greyeagle.ca.';
}
