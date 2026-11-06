import { Deck } from '../types/quiz.js';

export const DEFAULT_PYTHON_DECKS: Deck[] = [
  {
    id: 'deck-slicing-sequences',
    title: 'Python Slicing & Sequence Operations',
    description: 'Master slice notation [start:stop:step], negative indexes, reversals, and stride mechanics without off-by-one errors.',
    category: 'core',
    tags: ['Sequences', 'Slicing', 'Strings', 'Lists'],
    createdAt: 1710000000000,
    masteryPercentage: 0,
    missedCardIds: [],
    totalAttempts: 0,
    firstTryCorrectCount: 0,
    cards: [
      {
        id: 'card-slice-1',
        topic: 'Sequence Slicing',
        conceptTitle: 'List Reversal with Negative Stride',
        explanation: 'In Python, sequence slicing accepts a third parameter [start:stop:step]. A negative step traverses elements backward.',
        codeSnippet: `numbers = [1, 2, 3, 4, 5]
reversed_nums = numbers[___BLANK___]
print(reversed_nums)  # Output: [5, 4, 3, 2, 1]`,
        blankTarget: '::-1',
        hint: 'Use two colons to omit start and stop, then supply -1 for the step stride.',
        stepByStepSolution: [
          'Python slices are formatted as [start:stop:step].',
          'Omitting start and stop defaults to the very beginning and end of the sequence.',
          'Setting step to -1 reverses the entire collection in O(N) time.',
        ],
        commonMistakes: 'Writing [::-0] which raises ValueError: slice step cannot be zero, or writing [-1::] which only yields the last element.',
        difficulty: 'beginner',
      },
      {
        id: 'card-slice-2',
        topic: 'Sequence Slicing',
        conceptTitle: 'Extracting Every Second Element',
        explanation: 'Specify a stride to skip elements across a sequence without writing explicit loops.',
        codeSnippet: `items = ['a', 'b', 'c', 'd', 'e', 'f']
evens = items[___BLANK___]
print(evens)  # Output: ['a', 'c', 'e']`,
        blankTarget: '::2',
        hint: 'Double colon followed by the step increment.',
        stepByStepSolution: [
          'The first colon indicates the boundary between start and stop.',
          'The second colon precedes the step value.',
          'A step of 2 takes index 0, then 2, then 4.',
        ],
        commonMistakes: 'Using [0:2] which stops at index 2 (giving only [\'a\', \'b\']).',
        difficulty: 'beginner',
      },
      {
        id: 'card-slice-3',
        topic: 'Dictionary Access',
        conceptTitle: 'Safe Key Lookup with Default Value',
        explanation: 'Avoid KeyError when accessing dictionary keys by using a built-in method that provides a safe fallback.',
        codeSnippet: `user_settings = {'theme': 'dark'}
font_size = user_settings.___BLANK___('font_size', 14)
print(font_size)  # Output: 14`,
        blankTarget: 'get',
        hint: 'The standard dictionary method for safe retrieval with a fallback.',
        stepByStepSolution: [
          'Direct indexing user_settings[\'font_size\'] would raise a KeyError.',
          'The .get() method returns None or the supplied default argument if the key is not present.',
        ],
        commonMistakes: 'Using .pop() which removes the key or .setdefault() which mutates the dictionary.',
        difficulty: 'beginner',
      },
      {
        id: 'card-slice-4',
        topic: 'List Comprehensions',
        conceptTitle: 'Conditional Filtering in Comprehension',
        explanation: 'Comprehensions allow inline filtering placed at the end of the generator clause.',
        codeSnippet: `raw_scores = [45, 82, 91, 55, 78, 62]
passing = [score for score in raw_scores ___BLANK___ score >= 60]
print(passing)  # Output: [82, 91, 78, 62]`,
        blankTarget: 'if',
        hint: 'The conditional filter keyword in comprehension syntax.',
        stepByStepSolution: [
          'Comprehension syntax follows: [expr for item in iterable if condition].',
          'The if keyword filters which items are evaluated and emitted.',
        ],
        commonMistakes: 'Trying to place if/else before for when filtering without an else alternative.',
        difficulty: 'beginner',
      },
    ],
  },
  {
    id: 'deck-generators-iterators',
    title: 'Iterators, Generators & Comprehensions',
    description: 'Learn memory-efficient streaming, custom generators with yield, iter protocol, and zip/enumerate patterns.',
    category: 'core',
    tags: ['Generators', 'Iterators', 'Yield', 'Memory'],
    createdAt: 1710000001000,
    masteryPercentage: 0,
    missedCardIds: [],
    totalAttempts: 0,
    firstTryCorrectCount: 0,
    cards: [
      {
        id: 'card-gen-1',
        topic: 'Generators',
        conceptTitle: 'Pausing Execution in Generator Functions',
        explanation: 'Generators produce values on demand, saving memory compared to returning giant pre-allocated lists.',
        codeSnippet: `def countdown(n):
    while n > 0:
        ___BLANK___ n
        n -= 1`,
        blankTarget: 'yield',
        hint: 'The keyword that produces a value and suspends local state.',
        stepByStepSolution: [
          'The yield statement suspends function execution and saves the local state.',
          'When next() is called on the generator, execution resumes immediately after the yield.',
          'Unlike return, the function does not terminate.',
        ],
        commonMistakes: 'Using return which terminates the generator after the first value.',
        difficulty: 'intermediate',
      },
      {
        id: 'card-gen-2',
        topic: 'Iter Protocol',
        conceptTitle: 'Manual Value Extraction from Iterators',
        explanation: 'Retrieve the subsequent item from an iterator object using Python\'s built-in function.',
        codeSnippet: `stream = iter([10, 20, 30])
first_item = ___BLANK___(stream)
print(first_item)  # Output: 10`,
        blankTarget: 'next',
        hint: 'Built-in function that invokes the iterator\'s __next__() method.',
        stepByStepSolution: [
          'iter() converts an iterable into an iterator.',
          'next(iterator) advances the iterator and retrieves the current item.',
          'When exhausted, it raises StopIteration unless a default fallback is passed: next(it, default).',
        ],
        commonMistakes: 'Calling stream.get() or stream.pop().',
        difficulty: 'intermediate',
      },
      {
        id: 'card-gen-3',
        topic: 'Sequence Utilities',
        conceptTitle: 'Looping with Automatic Index Tracking',
        explanation: 'Avoid tracking manual index counters when iterating through sequences.',
        codeSnippet: `fruits = ['apple', 'banana', 'cherry']
for idx, fruit in ___BLANK___(fruits, start=1):
    print(f"{idx}: {fruit}")`,
        blankTarget: 'enumerate',
        hint: 'Returns an iterator of index-element tuples.',
        stepByStepSolution: [
          'enumerate(iterable, start=0) yields (index, value) tuples.',
          'The optional start parameter allows 1-based indexing for user-facing output.',
        ],
        commonMistakes: 'Using range(len(fruits)) which requires redundant index lookups: fruits[i].',
        difficulty: 'intermediate',
      },
      {
        id: 'card-gen-4',
        topic: 'Generators',
        conceptTitle: 'Delegating to a Sub-Generator',
        explanation: 'Delegate iteration to another generator or iterable cleanly in Python 3.3+.',
        codeSnippet: `def nested_emitter(sublists):
    for sub in sublists:
        ___BLANK___ sub`,
        blankTarget: 'yield from',
        hint: 'Two words: yields all items from the iterable or sub-generator.',
        stepByStepSolution: [
          'yield from delegates value production directly to the inner iterable.',
          'It replaces an explicit for x in sub: yield x loop and properly forwards return values and exceptions.',
        ],
        commonMistakes: 'Using plain yield sub which emits the entire list object rather than each individual item.',
        difficulty: 'advanced',
      },
    ],
  },
  {
    id: 'deck-oop-dunder',
    title: 'Object-Oriented & Dunder Magic Methods',
    description: 'Master Python OOP mechanics, operator overloading, __init__, super(), @property, and string representations.',
    category: 'core',
    tags: ['OOP', 'Dunder', 'Inheritance', 'Classes'],
    createdAt: 1710000002000,
    masteryPercentage: 0,
    missedCardIds: [],
    totalAttempts: 0,
    firstTryCorrectCount: 0,
    cards: [
      {
        id: 'card-oop-1',
        topic: 'Inheritance',
        conceptTitle: 'Delegating to Parent Class Constructor',
        explanation: 'Call the superclass method using standard Python cooperative inheritance.',
        codeSnippet: `class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        ___BLANK___.__init__(name)
        self.breed = breed`,
        blankTarget: 'super()',
        hint: 'Returns a proxy object delegating method calls to a parent or sibling class.',
        stepByStepSolution: [
          'super() returns a proxy object that delegates method calls to parent classes in the MRO (Method Resolution Order).',
          'super().__init__(name) initializes the parent attributes without hardcoding Animal.__init__(self, name).',
        ],
        commonMistakes: 'Forgetting parentheses like super.__init__ or passing self to super().__init__(self, name).',
        difficulty: 'intermediate',
      },
      {
        id: 'card-oop-2',
        topic: 'String Representations',
        conceptTitle: 'Unambiguous Developer Representation',
        explanation: 'Define the formal string representation used in debugging and the interactive REPL.',
        codeSnippet: `class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def ___BLANK___(self):
        return f"Vector(x={self.x}, y={self.y})"`,
        blankTarget: '__repr__',
        hint: 'Dunder method for developer-friendly representation (often executable Python code).',
        stepByStepSolution: [
          '__repr__ should provide an unambiguous representation of the object.',
          '__str__ is intended for friendly end-user displays.',
          'If __str__ is not defined, Python falls back to __repr__ automatically.',
        ],
        commonMistakes: 'Confusing __str__ and __repr__, or returning non-string types.',
        difficulty: 'intermediate',
      },
      {
        id: 'card-oop-3',
        topic: 'Encapsulation & Decorators',
        conceptTitle: 'Creating Read-Only Computed Attributes',
        explanation: 'Expose a method as an attribute without parentheses using a built-in decorator.',
        codeSnippet: `class Circle:
    def __init__(self, radius):
        self.radius = radius

    ___BLANK___
    def area(self):
        return 3.14159 * (self.radius ** 2)`,
        blankTarget: '@property',
        hint: 'Decorator that allows accessing area as circle.area instead of circle.area().',
        stepByStepSolution: [
          '@property defines a getter for a managed attribute.',
          'Callers can access c.area with attribute syntax, avoiding unnecessary explicit getters.',
        ],
        commonMistakes: 'Writing @getter or forgetting the @ symbol.',
        difficulty: 'intermediate',
      },
      {
        id: 'card-oop-4',
        topic: 'Container Protocol',
        conceptTitle: 'Indexing Protocol with __getitem__',
        explanation: 'Allow custom class instances to support square bracket indexing: obj[key].',
        codeSnippet: `class Registry:
    def __init__(self):
        self._items = {}

    def ___BLANK___(self, key):
        return self._items[key]`,
        blankTarget: '__getitem__',
        hint: 'Dunder method invoked by obj[key].',
        stepByStepSolution: [
          'The __getitem__(self, key) method implements evaluation of self[key].',
          'Implementing __getitem__ on sequence types also provides automatic iteration support.',
        ],
        commonMistakes: 'Writing __get__ (which is descriptor protocol) or __item__.',
        difficulty: 'advanced',
      },
    ],
  },
  {
    id: 'deck-errors-context',
    title: 'Error Handling & Context Managers',
    description: 'Safely handle exceptions with try/except/else/finally and build robust context managers using with statements.',
    category: 'core',
    tags: ['Exceptions', 'Context Managers', 'With', 'Cleanup'],
    createdAt: 1710000003000,
    masteryPercentage: 0,
    missedCardIds: [],
    totalAttempts: 0,
    firstTryCorrectCount: 0,
    cards: [
      {
        id: 'card-err-1',
        topic: 'Exception Flow',
        conceptTitle: 'Executing Code Only When No Exception Occurred',
        explanation: 'In Python\'s try/except statement, run code specifically when no exception was raised.',
        codeSnippet: `try:
    data = int("123")
except ValueError:
    print("Invalid number")
___BLANK___:
    print(f"Parsed successfully: {data}")`,
        blankTarget: 'else',
        hint: 'Clause that executes strictly if the try block ran without errors.',
        stepByStepSolution: [
          'The else block executes only if the try clause completes without raising an exception.',
          'This keeps the try block focused strictly on code that might raise the targeted exception.',
        ],
        commonMistakes: 'Placing success logic in finally, which executes even when errors happen.',
        difficulty: 'intermediate',
      },
      {
        id: 'card-err-2',
        topic: 'Context Management',
        conceptTitle: 'The Enter Hook for Context Managers',
        explanation: 'Dunder method invoked when entering a with statement block.',
        codeSnippet: `class DatabaseSession:
    def ___BLANK___(self):
        print("Opening transaction...")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Closing transaction...")`,
        blankTarget: '__enter__',
        hint: 'Dunder method that returns the resource bound by as.',
        stepByStepSolution: [
          'with DatabaseSession() as sess triggers __enter__ first.',
          'The return value of __enter__ is bound to the variable named after as.',
          '__exit__ is guaranteed to execute upon leaving the block.',
        ],
        commonMistakes: 'Naming it __open__ or forgetting the double underscores.',
        difficulty: 'intermediate',
      },
      {
        id: 'card-err-3',
        topic: 'Type Validation',
        conceptTitle: 'Checking Object Type with Inheritance Awareness',
        explanation: 'Verify whether an object is an instance of a class or any of its subclasses.',
        codeSnippet: `class Square:
    pass

s = Square()
if ___BLANK___(s, Square):
    print("Valid square")`,
        blankTarget: 'isinstance',
        hint: 'Built-in function accepting (object, class_or_tuple).',
        stepByStepSolution: [
          'isinstance(object, classinfo) checks if an object is an instance of the class or a derived class.',
          'Unlike type(s) == Square, isinstance supports polymorphism and inheritance hierarchies.',
        ],
        commonMistakes: 'Using type(s) is Square which fails for subclasses.',
        difficulty: 'beginner',
      },
    ],
  },
];
