"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = FormValuesView;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _componentMessageBus = require("@ivoyant/component-message-bus");
require("./styles.css");
var _jsonata = _interopRequireDefault(require("jsonata"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// eslint-disable-next-line import/no-extraneous-dependencies

function FormValuesView(props) {
  const {
    data
  } = props.data;
  const {
    component,
    parentProps
  } = props;
  const {
    params
  } = component;
  const {
    fields
  } = params;
  const [loading, setLoading] = (0, _react.useState)(false);
  const [checked, setChecked] = (0, _react.useState)(undefined);
  let switchConfig;
  const onSwitchToggle = (switchChecked, event) => {
    setLoading(true);
    const datasource = parentProps.datasources[switchConfig.datasource];
    const {
      requestMapping,
      responseMapping
    } = switchConfig;
    _componentMessageBus.MessageBus.subscribe(switchConfig.workflow, 'WF.'.concat(switchConfig.workflow).concat('.STATE.CHANGE'), handleResponse(switchChecked));
    _componentMessageBus.MessageBus.send('WF.'.concat(switchConfig.workflow).concat('.INIT'), {
      header: {
        registrationId: switchConfig.workflow,
        workflow: switchConfig.workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(switchConfig.workflow).concat('.SUBMIT'), {
      header: {
        registrationId: switchConfig.workflow,
        workflow: switchConfig.workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource,
        request: {
          ...data
        },
        requestMapping,
        responseMapping
      }
    });
  };
  const handleResponse = switchChecked => (subscriptionId, topic, eventData) => {
    const isSuccess = switchConfig.successStates.includes(eventData.value);
    const isError = switchConfig.errorStates.includes(eventData.value);
    if (isSuccess || isError) {
      setLoading(false);
      if (isError) {
        setChecked(switchChecked);
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const getComponent = componentConfig => {
    //  For now only switch
    switchConfig = componentConfig;
    const defaultChecked = componentConfig.toggleExpr ? (0, _jsonata.default)(componentConfig.toggleExpr).evaluate(data) : false;
    return /*#__PURE__*/_react.default.createElement("span", {
      className: "customer-summary-form-value"
    }, /*#__PURE__*/_react.default.createElement(_antd.Switch, {
      size: componentConfig?.size || 'small',
      loading: loading,
      onClick: onSwitchToggle,
      checked: defaultChecked
    }));
  };
  return /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "py-4 form-label"
  }, Object.keys(fields).map((key, index) => {
    return /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: {
        span: 24
      },
      md: {
        span: 12
      },
      key: index
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "flex-row"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "customer-summary-form customer-summary-form-label"
    }, key), /*#__PURE__*/_react.default.createElement("span", null, ":", ' ', fields[key]?.expr ? /*#__PURE__*/_react.default.createElement("span", {
      className: "customer-summary-form customer-summary-form-value"
    }, (0, _jsonata.default)(fields[key].expr).evaluate(data)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, getComponent(fields[key])))));
  }));
}
module.exports = exports.default;