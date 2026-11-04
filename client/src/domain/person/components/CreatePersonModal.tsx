import { useState } from 'react';

import { App, Divider, Form, message, Modal } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';

import { createPerson } from '../api/create-person.service';
import { usePeopleContext } from '../People.context';
import { cleanPersonValues, PersonFields, type Values } from './PersonFields';

export function CreatePersonModal() {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchPeople } = usePeopleContext();

    const [form] = Form.useForm<Values>();

    const app = App.useApp();

    const close = () => setIsCreateModalVisible(false);

    const onFinish = async (values: Values) => {
        setIsSending(true);

        try {
            const response = await createPerson(cleanPersonValues(values));

            await sleep(1000);

            if (hasServiceError(response)) {
                if (response.statusCode === 409) {
                    message.error('Este CPF já está cadastrado no sistema.');
                    return;
                }

                return handleServiceError(app, response);
            }

            close();
            fetchPeople();
        } catch (error) {
            const err = error as { statusCode?: number; response?: { status?: number }; status?: number; code?: number; message?: string } | null;
            if (
                err?.statusCode === 409 ||
                err?.response?.status === 409 ||
                err?.status === 409 ||
                err?.code === 409 ||
                (typeof err?.message === 'string' && err.message.includes('409'))
            ) {
                message.error('Este CPF já está cadastrado no sistema.');
                return;
            }

            handleServiceError(app, error instanceof Error ? error : new Error(String(error)));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Modal
            open
            title="Cadastrar pessoa"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Cadastrar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="createPerson"
                layout="vertical"
                autoComplete="off"
            >
                <PersonFields />
            </Form>
        </Modal>
    );
}
