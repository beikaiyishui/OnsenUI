/* Private */
const _formatOutput = (modifiers = {}, output) => {
  if (Object.hasOwnProperty.call(modifiers, 'number')) {
    return Number(output);
  }
  if (Object.hasOwnProperty.call(modifiers, 'trim')) {
    return output.trim();
  }
  return output;
};
const _bindOn = (eventName, modelKey, vnode, handler) => {
  if (vnode.context.hasOwnProperty(modelKey)) {
    vnode.child.$on(eventName, handler);
  }
};
const _bindSimpleInputOn = (eventName, modelKey, vnode, propName) => {
  _bindOn(eventName, modelKey, vnode, event => {
    vnode.context[modelKey] = event.target[propName];
  });
};
const _bindModifierInputOn = (eventName, modelKey, vnode, modifiers) => {
  _bindOn(eventName, modelKey, vnode, event => {
    vnode.context[modelKey] = _formatOutput(modifiers, event.target.value);
  });
};
const _bindArrayInputOn = (eventName, modelKey, vnode) => {
  _bindOn(eventName, modelKey, vnode, event => {
    if (vnode.context[modelKey].indexOf(event.target.value) >= 0) {
      !event.target.checked && vnode.context[modelKey].splice(vnode.context[modelKey].indexOf(event.target.value), 1);
    } else {
      event.target.checked && vnode.context[modelKey].push(event.target.value);
    }
  });
};
const _bindCheckbox = (el, binding, vnode, modelKey) => {
  if (binding.value instanceof Array) {
    el.checked = binding.value.indexOf(el.value) >= 0;
    _bindArrayInputOn('change', modelKey, vnode);
  } else {
    el.checked = !!binding.value;
    _bindSimpleInputOn('change', modelKey, vnode, 'checked');
  }
};
const _updateCheckbox = (el, binding, vnode, modelKey) => {
  if (binding.value instanceof Array) {
    el.checked = (vnode.context[modelKey] || []).indexOf(el.value) >= 0;
  } else {
    el.checked = !!binding.value;
  }
};

/* Public */
// VOnsModel directive
export default {
  bind(el, binding, vnode) {
    const modelKey = binding.expression.trim();
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case 'ons-select':
        el.querySelector('option[value=' + binding.value + ']').setAttribute('selected', 'selected');
        _bindSimpleInputOn('change', modelKey, vnode, 'value');
        break;

      case 'ons-switch':
        _bindCheckbox(el, binding, vnode, modelKey);
        break;

      case 'ons-range':
        el.value = binding.value;
        _bindModifierInputOn(Object.hasOwnProperty.call(binding.modifiers, 'lazy') ? 'change' : 'input', modelKey, vnode, binding.modifiers);
        break;

      case 'ons-input':
        switch (el.type) {
          case 'radio':
            el.checked = el.value === binding.value;
            _bindSimpleInputOn('change', modelKey, vnode, 'value');
            break;

          case 'checkbox':
            _bindCheckbox(el, binding, vnode, modelKey);
            break;

          default:
            el.value = binding.value;
            _bindModifierInputOn(Object.hasOwnProperty.call(binding.modifiers, 'lazy') ? 'change' : 'input', modelKey, vnode, binding.modifiers);
        }
        break;

      default:
        throw new Error('"v-ons-model" directive cannot be used with "' + tag + '" element.');
    }
  },

  update(el, binding, vnode) {
    const modelKey = binding.expression.trim();
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case 'ons-select':
        el.querySelectorAll('option').forEach(function (option) { option.value == binding.value ? option.setAttribute('selected', 'selected') : option.removeAttribute('selected') });
        break;

      case 'ons-switch':
        _updateCheckbox(el, binding, vnode, modelKey);
        break;

      case 'ons-range':
        el.value = binding.value;
        break;

      case 'ons-input':
        switch (el.type) {
          case 'radio':
            el.checked = vnode.context[modelKey] === el.value;
            break;

          case 'checkbox':
            _updateCheckbox(el, binding, vnode, modelKey);
            break;

          default:
            el.value = binding.value;
        }
        break;
    }
  }
};
