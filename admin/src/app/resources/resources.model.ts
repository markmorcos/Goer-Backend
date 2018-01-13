export const admins = [
  {
    type: 'object',
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
    ],
    list: true
  },
  {
    type: 'email',
    name: 'email',
    placeholder: 'Email',
    list: true
  },
  {
    type: 'password',
    name: 'password',
    placeholder: 'Password'
  }
];

export const businesses = [
  {
    type: 'text',
    name: 'picture',
    placeholder: 'Picture',
    list: true
  },
  {
    type: 'text',
    name: 'name',
    placeholder: 'Name',
    list: true
  },
  {
    type: 'text',
    name: 'location',
    placeholder: 'Location',
    list: true
  },
  {
    type: 'email',
    name: 'email',
    placeholder: 'Email',
    list: true
  },
  {
    type: 'password',
    name: 'password',
    placeholder: 'Password'
  },
  {
    type: 'text',
    name: 'phone',
    placeholder: 'Phone',
    list: true
  },
  {
    type: 'text',
    name: 'confirmation',
    placeholder: 'Confirmation'
  },
  {
    type: 'textarea',
    name: 'description',
    placeholder: 'Description'
  },
  {
    type: 'text',
    name: 'language',
    placeholder: 'Language'
  },
  {
    type: 'text',
    name: 'approved',
    placeholder: 'Approved'
  },
  {
    type: 'text',
    name: 'confirmed',
    placeholder: 'Confirmed'
  },
  {
    type: 'text',
    name: 'tags',
    placeholder: 'Tags'
  }
];

export const users = [
  {
    type: 'text',
    name: 'picture',
    placeholder: 'Picture',
    list: true
  },
  {
    type: 'object',
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
    ],
    list: true
  },
  {
    type: 'email',
    name: 'email',
    placeholder: 'Email',
    list: true
  },
  {
    type: 'password',
    name: 'password',
    placeholder: 'Password'
  },
  {
    type: 'text',
    name: 'gender',
    placeholder: 'Gender'
  },
  {
    type: 'text',
    name: 'birthdate',
    placeholder: 'Birthdate'
  },
  {
    type: 'text',
    name: 'phone',
    placeholder: 'Phone'
  },
  {
    type: 'text',
    name: 'confirmation',
    placeholder: 'Confirmation'
  },
  {
    type: 'textarea',
    name: 'description',
    placeholder: 'Description'
  },
  {
    type: 'text',
    name: 'language',
    placeholder: 'Language'
  },
  {
    type: 'text',
    name: 'approved',
    placeholder: 'Approved'
  },
  {
    type: 'text',
    name: 'confirmed',
    placeholder: 'Confirmed'
  },
  {
    type: 'text',
    name: 'tags',
    placeholder: 'Tags'
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
