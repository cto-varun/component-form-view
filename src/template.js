import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Switch, notification } from 'antd';
import { MessageBus } from '@ivoyant/component-message-bus';
import './styles.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import jsonata from 'jsonata';

export default function FormValuesView(props) {
    const { data } = props.data;
    const { component, parentProps } = props;
    const { params } = component;
    const { fields } = params;
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(undefined);
    let switchConfig;

    const onSwitchToggle = (switchChecked, event) => {
        setLoading(true);
        const datasource = parentProps.datasources[switchConfig.datasource];
        const { requestMapping, responseMapping } = switchConfig;
        MessageBus.subscribe(
            switchConfig.workflow,
            'WF.'.concat(switchConfig.workflow).concat('.STATE.CHANGE'),
            handleResponse(switchChecked)
        );
        MessageBus.send('WF.'.concat(switchConfig.workflow).concat('.INIT'), {
            header: {
                registrationId: switchConfig.workflow,
                workflow: switchConfig.workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.send('WF.'.concat(switchConfig.workflow).concat('.SUBMIT'), {
            header: {
                registrationId: switchConfig.workflow,
                workflow: switchConfig.workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource,
                request: { ...data },
                requestMapping,
                responseMapping,
            },
        });
    };

    const handleResponse = (switchChecked) => (
        subscriptionId,
        topic,
        eventData
    ) => {
        const isSuccess = switchConfig.successStates.includes(eventData.value);
        const isError = switchConfig.errorStates.includes(eventData.value);
        if (isSuccess || isError) {
            setLoading(false);
            if (isError) {
                setChecked(switchChecked);
            }
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const getComponent = (componentConfig) => {
        //  For now only switch
        switchConfig = componentConfig;
        const defaultChecked = componentConfig.toggleExpr
            ? jsonata(componentConfig.toggleExpr).evaluate(data)
            : false;
        return (
            <span className="customer-summary-form-value">
                <Switch
                    size={componentConfig?.size || 'small'}
                    loading={loading}
                    onClick={onSwitchToggle}
                    checked={defaultChecked}
                />
            </span>
        );
    };

    return (
        <Row className="py-4 form-label">
            {Object.keys(fields).map((key, index) => {
                return (
                    <Col xs={{ span: 24 }} md={{ span: 12 }} key={index}>
                        <div className="flex-row">
                            <span className="customer-summary-form customer-summary-form-label">
                                {key}
                            </span>
                            <span>
                                :{' '}
                                {fields[key]?.expr ? (
                                    <span className="customer-summary-form customer-summary-form-value">
                                        {jsonata(fields[key].expr).evaluate(
                                            data
                                        )}
                                    </span>
                                ) : (
                                    <>{getComponent(fields[key])}</>
                                )}
                            </span>
                        </div>
                    </Col>
                );
            })}
        </Row>
    );
}
