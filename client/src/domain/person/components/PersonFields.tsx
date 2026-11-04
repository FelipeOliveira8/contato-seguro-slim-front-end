import { forwardRef, Fragment } from 'react';

import { DatePicker, Form, Input } from 'antd';

import dayjs, { type Dayjs } from 'dayjs';

export type Values = {
    name: string;
    cpf: string;
    email: string;
    birth_date: Dayjs | string;
};

export type PersonPayload = {
    name: string;
    cpf: string;
    email: string;
    birth_date: string;
};

export const formatCpf = (value?: string): string => {
    if (!value) return '';
    const numeric = value.replace(/\D/g, '').slice(0, 11);
    if (numeric.length <= 3) return numeric;
    if (numeric.length <= 6) return `${numeric.slice(0, 3)}.${numeric.slice(3)}`;
    if (numeric.length <= 9) return `${numeric.slice(0, 3)}.${numeric.slice(3, 6)}.${numeric.slice(6)}`;
    return `${numeric.slice(0, 3)}.${numeric.slice(3, 6)}.${numeric.slice(6, 9)}-${numeric.slice(9, 11)}`;
};

export const cleanCpf = (value?: string): string => {
    return (value || '').replace(/\D/g, '');
};

export const formatDate = (value?: string): string => {
    if (!value) return '';
    const numeric = value.replace(/\D/g, '').slice(0, 8);
    if (numeric.length <= 2) return numeric;
    if (numeric.length <= 4) return `${numeric.slice(0, 2)}/${numeric.slice(2)}`;
    return `${numeric.slice(0, 2)}/${numeric.slice(2, 4)}/${numeric.slice(4)}`;
};

export const cleanPersonValues = (values: Values): PersonPayload => {
    return {
        ...values,
        cpf: cleanCpf(values.cpf),
        birth_date: values.birth_date ? dayjs(values.birth_date).format('YYYY-MM-DD') : '',
    };
};

export const formatPersonPayload = cleanPersonValues;
export const cleanPersonPayload = cleanPersonValues;
export const formatPersonValues = cleanPersonValues;

export const MaskedDateInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => {
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (
                e.key === 'Backspace' ||
                e.key === 'Delete' ||
                e.key === 'Tab' ||
                e.key === 'Enter' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowDown' ||
                e.key === 'Home' ||
                e.key === 'End' ||
                e.ctrlKey ||
                e.metaKey
            ) {
                props.onKeyDown?.(e);
                return;
            }

            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
                return;
            }

            props.onKeyDown?.(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            e.target.value = formatDate(e.target.value);
            props.onChange?.(e);
        };

        return (
            <input
                {...props}
                ref={ref}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                maxLength={10}
            />
        );
    }
);
MaskedDateInput.displayName = 'MaskedDateInput';

export function PersonFields() {
    return (
        <Fragment>
            <Form.Item<Values>
                name="name"
                label="Nome"
                rules={[{ required: true, message: 'Por favor, digite um nome.' }]}
            >
                <Input placeholder="Nome da pessoa" />
            </Form.Item>

            <Form.Item<Values>
                name="cpf"
                label="CPF"
                normalize={(value) => formatCpf(value)}
                getValueProps={(value) => ({ value: formatCpf(value) })}
                rules={[
                    { required: true, message: 'Por favor, digite um CPF.' },
                    {
                        validator: (_, value) => {
                            const numeric = cleanCpf(value);
                            if (!numeric) {
                                return Promise.resolve();
                            }
                            if (numeric.length !== 11) {
                                return Promise.reject(new Error('O CPF deve ter 11 dígitos.'));
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
            >
                <Input
                    placeholder="000.000.000-00"
                    maxLength={14}
                    onChange={(e) => {
                        e.target.value = formatCpf(e.target.value);
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

            <Form.Item<Values>
                name="birth_date"
                label="Data de Nascimento"
                getValueProps={(value) => {
                    if (!value) return { value: undefined };
                    if (dayjs.isDayjs(value)) {
                        return { value: value.isValid() ? value : undefined };
                    }
                    if (typeof value === 'string') {
                        const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                        if (match) {
                            const [, day, month, year] = match;
                            const d = dayjs(`${year}-${month}-${day}`);
                            return { value: d.isValid() ? d : undefined };
                        }
                        const d = dayjs(value);
                        return { value: d.isValid() ? d : undefined };
                    }
                    return { value: undefined };
                }}
                rules={[
                    { required: true, message: 'Por favor, selecione uma data de nascimento.' },
                ]}
            >
                <DatePicker
                    placeholder="DD/MM/AAAA"
                    format="DD/MM/YYYY"
                    style={{ width: '100%' }}
                    needConfirm={false}
                    preserveInvalidOnBlur
                    components={{
                        input: MaskedDateInput,
                    }}
                />
            </Form.Item>
        </Fragment>
    );
}