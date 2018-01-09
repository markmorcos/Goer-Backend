export const admins = [
  {
    type: 'nested',
    name: 'name',
    fields: [
      {
        type: 'text',
        name: 'first',
        placeholder: 'First Name'
      },
      {
        type: 'text',
        name: 'last',
        placeholder: 'Last Name'
      }
    ]
  },
  {
    type: 'email',
    name: 'email',
    placeholder: 'Email'
  },
  {
    type: 'password',
    name: 'password',
    placeholder: 'Password'
  }
];

export const tags = [
  {
    type: 'text',
    name: 'name',
    placeholder: 'Name'
  }
];

export const statics = [
  {
    type: 'text',
    name: 'slug',
    placeholder: 'Slug'
  },
  {
    type: 'text',
    name: 'title',
    placeholder: 'Title'
  },
  {
    type: 'textarea',
    name: 'text',
    placeholder: 'Text'
  }
];

export const feedbacks = [
  {
    type: 'text',
    name: 'user',
    placeholder: 'User'
  },
  {
    type: 'text',
    name: 'text',
    placeholder: 'Text'
  }
];
