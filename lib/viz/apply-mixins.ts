var _ = require('underscore');

function applyMixins(targetClass: any, mixinClass: any) {
    _.each(Object.getOwnPropertyNames(mixinClass.prototype), name => {
        targetClass.prototype[name] = mixinClass.prototype[name];
    });
}

export = applyMixins;