import { Fragment } from 'react';

import { Form, Input } from 'antd';

export type Values = {
    name: string;
    cnpj: string;
    email: string;
};

export type CompanyPayload = {
    name: string;
    cnpj: string;
    email: string;
};

const formatCnpj = (value?: string): string => {
    if (!value) return '';
    const numeric = value.replace(/\D/g, '').slice(0, 14);
    if (numeric.length <= 2) return numeric;
    if (numeric.length <= 5) return `${numeric.slice(0, 2)}.${numeric.slice(2)}`;
    if (numeric.length <= 8) return `${numeric.slice(0, 2)}.${numeric.slice(2, 5)}.${numeric.slice(5)}`;
    if (numeric.length <= 12)
        return `${numeric.slice(0, 2)}.${numeric.slice(2, 5)}.${numeric.slice(5, 8)}/${numeric.slice(8)}`;
    return `${numeric.slice(0, 2)}.${numeric.slice(2, 5)}.${numeric.slice(5, 8)}/${numeric.slice(8, 12)}-${numeric.slice(12)}`;
};

const cleanCnpj = (value?: string): string => {
    return (value || '').replace(/\D/g, '');
};

export const cleanCompanyValues = (values: Values): CompanyPayload => {
    return {
        ...values,
        cnpj: cleanCnpj(values.cnpj),
    };
};
export function CompanyFields() {
    return (
        <Fragment>
            <Form.Item<Values>
                name="name"
                label="Nome"
                rules={[{ required: true, message: 'Por favor, digite um nome.' }]}
            >
                <Input placeholder="Nome da empresa" />
            </Form.Item>

            <Form.Item<Values>
                name="cnpj"
                label="CNPJ"
                normalize={(value) => formatCnpj(value)}
                getValueProps={(value) => ({ value: formatCnpj(value) })}
                rules={[
                    { required: true, message: 'Por favor, digite um CNPJ.' },
                    {
                        validator: (_, value) => {
                            const numeric = cleanCnpj(value);
                            if (!numeric) {
                                return Promise.resolve();
                            }
                            if (numeric.length !== 14) {
                                return Promise.reject(new Error('O CNPJ deve ter 14 dígitos.'));
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
            >
                <Input
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    onChange={(e) => {
                        e.target.value = formatCnpj(e.target.value);
                    }}
                />
            </Form.Item>

            <Form.Item<Values>
                name="email"
                label="E-mail"
                rules={[
                    { required: true, message: 'Por favor, digite um e-mail.' },
                    { type: 'email', message: 'Por favor, digite um e-mail válido.' },
                ]}
            >
                <Input placeholder="E-mail de contato" />
            </Form.Item>
        </Fragment>
    );
}
