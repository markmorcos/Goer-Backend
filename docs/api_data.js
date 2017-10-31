define({ "api": [
  {
    "type": "put",
    "url": "/api/accept",
    "title": "Accept follow request",
    "name": "AcceptRequest",
    "group": "Follow",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User ID to accept</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/FollowController.js",
    "groupTitle": "Follow",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/accept"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/follow",
    "title": "Follow user",
    "name": "FollowUser",
    "group": "Follow",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User ID to follow</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/FollowController.js",
    "groupTitle": "Follow",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/follow"
      }
    ]
  },
  {
    "type": "get",
    "url": "/api/follows",
    "title": "Read all follows",
    "name": "ReadFollows",
    "group": "Follow",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Follow list type; followers, following or requests</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "users",
            "description": "<p>List of follows</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/FollowController.js",
    "groupTitle": "Follow",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/follows"
      }
    ]
  },
  {
    "type": "delete",
    "url": "/api/reject",
    "title": "Reject follow request",
    "name": "RejectRequest",
    "group": "Follow",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User ID to reject</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/FollowController.js",
    "groupTitle": "Follow",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/reject"
      }
    ]
  },
  {
    "type": "delete",
    "url": "/api/unfollow",
    "title": "Unfollow user",
    "name": "UnfollowUser",
    "group": "Follow",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User ID to unfollow</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/FollowController.js",
    "groupTitle": "Follow",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/unfollow"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/preference",
    "title": "Create new preference (Admin and manager only)",
    "name": "CreatePreference",
    "group": "Preference",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Preference name</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "preference",
            "description": "<p>Preference created</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/PreferenceController.js",
    "groupTitle": "Preference",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/preference"
      }
    ]
  },
  {
    "type": "delete",
    "url": "/api/preference",
    "title": "Delete existing preference (Admin and manager only)",
    "name": "DeletePreference",
    "group": "Preference",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Preference ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/PreferenceController.js",
    "groupTitle": "Preference",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/preference"
      }
    ]
  },
  {
    "type": "get",
    "url": "/api/preferences",
    "title": "Read all preferences",
    "name": "ReadPreferences",
    "group": "Preference",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "preferences",
            "description": "<p>List of preferences</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/PreferenceController.js",
    "groupTitle": "Preference",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/preferences"
      }
    ]
  },
  {
    "type": "put",
    "url": "/api/preference",
    "title": "Update existing preference (Admin and manager only)",
    "name": "UpdatePreference",
    "group": "Preference",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Preference name (Optional)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "preference",
            "description": "<p>Preference updated</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/PreferenceController.js",
    "groupTitle": "Preference",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/preference"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/confirm-user",
    "title": "Resend confirmation code to new user",
    "name": "ConfirmUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "confirmation",
            "description": "<p>Confirmation code</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/confirm-user"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/contact-business",
    "title": "Contact business by email",
    "name": "ContactBusiness",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Business ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>User message</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/contact-business"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/user",
    "title": "Create new user (Admin only)",
    "name": "CreateUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "File",
            "optional": false,
            "field": "picture",
            "description": "<p>picture (Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phone",
            "description": "<p>Phone (Optional in users only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Description (Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "language",
            "description": "<p>Language; en or ar (Optional, default: en)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "facebook",
            "description": "<p>(Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "instagram",
            "description": "<p>(Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>User first name (user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>User last name (user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gender",
            "description": "<p>User gender; male or female (Optional, default: male, user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "private",
            "description": "<p>Private; true or false (Optional, default: false, user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "birthdate",
            "description": "<p>User birthdate (user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Business name (business only)</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "location",
            "description": "<p>Business location; latitude and longitude (business only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "role",
            "description": "<p>Role; user, business, manager or admin (Optional, default: user)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>Signed up user details</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/user"
      }
    ]
  },
  {
    "type": "delete",
    "url": "/api/user",
    "title": "Delete existing user",
    "name": "DeleteUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/user"
      }
    ]
  },
  {
    "type": "get",
    "url": "/api/user",
    "title": "Read user profile",
    "name": "ReadUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>User details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/user"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/resend-confirmation",
    "title": "Resend confirmation code to new user",
    "name": "ResendConfirmation",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/resend-confirmation"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/reset-password",
    "title": "Reset user password by email",
    "name": "ResetPassword",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User email</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/reset-password"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/sign-in",
    "title": "Sign in existing user",
    "name": "SignIn",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>User password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>Signed in user details</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/sign-in"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/sign-up",
    "title": "Sign up new user",
    "name": "SignUp",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "File",
            "optional": false,
            "field": "picture",
            "description": "<p>picture (Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phone",
            "description": "<p>Phone (Optional in users only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Description (Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "language",
            "description": "<p>Language; en or ar (Optional, default: en)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "facebook",
            "description": "<p>(Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "instagram",
            "description": "<p>(Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>User first name (user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>User last name (user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gender",
            "description": "<p>User gender; male or female (Optional, default: male, user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "private",
            "description": "<p>Private; true or false (Optional, default: false, user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "birthdate",
            "description": "<p>User birthdate (user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Business name (business only)</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "location",
            "description": "<p>Business location; latitude and longitude (business only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "role",
            "description": "<p>Role; user, business, manager or admin (Optional, default: user)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>Signed up user details</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/sign-up"
      }
    ]
  },
  {
    "type": "put",
    "url": "/api/user",
    "title": "Update existing user",
    "name": "UpdateUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User ID (Optional, default: signed in user ID)</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": false,
            "field": "picture",
            "description": "<p>picture (Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email (Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password (Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phone",
            "description": "<p>Phone (Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Description (Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "language",
            "description": "<p>Language; en or ar (Optional, default: en)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "facebook",
            "description": "<p>(Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "instagram",
            "description": "<p>(Optional)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>User first name (Optional, user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>User last name (Optional, user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gender",
            "description": "<p>User gender; male or female (Optional, default: male, user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "private",
            "description": "<p>Private; true or false (Optional, default: false, user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "birthdate",
            "description": "<p>User birthdate (Optional, user only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Business name (Optional, business only)</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "location",
            "description": "<p>Business location; latitude and longitude (Optional, business only)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "role",
            "description": "<p>Role; user, business, manager or admin (Optional, default: user)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>Updated user details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>false</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/user"
      }
    ]
  }
] });
