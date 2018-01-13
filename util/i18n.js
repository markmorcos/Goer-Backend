exports.en = {
  request: {
    title: 'New Follow Request',
    body: function(options) {
      return `[[${options.user._id}]] requested to follow you`;
    },
    message: function(options) {
      return `${options.user.fullName} requested to follow you`;
    }
  },
  accept: {
    title: 'Follow Accepted',
    body: function(options) {
      return `[[${options.user._id}]] accepted your follow request`;
    },
    message: function(options) {
      return `${options.user.fullName} accepted your follow request`;
    }
  },
  reaction: {
    title: 'New Reaction',
    body: function(options) {
      return `[[${options.user._id}]] ${options.action}d your ${options.model.toLowerCase()}`;
    },
    message: function(options) {
      return `${options.user.fullName} ${options.action}d your ${options.model.toLowerCase()}`;
    }
  },
  review: {
    title: 'New Review',
    body: function(options) {
      return `[[${options.user._id}]] added a review to your business`;
    },
    message: function(options) {
      return `${options.user.fullName} added a review to your business`;
    }
  },
  comment: {
    title: 'New Comment',
    body: function(options) {
      return `[[${options.user._id}]] commented on your ${options.model.toLowerCase()}`;
    },
    message: function(options) {
      return `${options.user.fullName} commented on your ${options.model.toLowerCase()}`;
    }
  },
  mention: {
    title: 'New Mention',
    body: function(options) {
      return `[[${options.user._id}]] mentioned you in a ${options.model.toLowerCase()}`;
    },
    message: function(options) {
      return `${options.user.fullName} mentioned you in a ${options.model.toLowerCase()}`;
    }
  }
};

exports.in = {
  request: {
    title: '',
    body: function(options) {
      return '';
    }  ,
    message: function(options) {
      return '';
    }
  },
  accept: {
    title: '',
    body: function(options) {
      return '';
    },
    message: function(options) {
      return '';
    }
  },
  reaction: {
    title: '',
    body: function(options) {
      return '';
    }  ,
    message: function(options) {
      return '';
    }
  },
  review: {
    title: '',
    body: function(options) {
      return '';
    }  ,
    message: function(options) {
      return '';
    }
  },
  comment: {
    title: '',
    body: function(options) {
      return '';
    }  ,
    message: function(options) {
      return '';
    }
  },
  mention: {
    title: '',
    body: function(options) {
      return '';
    }  ,
    message: function(options) {
      return '';
    }
  }
};