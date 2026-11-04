import { useState } from 'react';

import { App, Divider, Form, Modal, message } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';

import { createCompany } from '../api/create-company.service';
import { useCompaniesContext } from '../Companies.context';
import { cleanCompanyValues, CompanyFields, type Values } from './CompanyFields';

export function CreateCompanyModal() {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchCompanies } = useCompaniesContext();

    const [form] = Form.useForm<Values>();

    const app = App.useApp();

    const close = () => setIsCreateModalVisible(false);

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await createCompany(cleanCompanyValues(values));

        await sleep(1000);


        if (hasServiceError(response)) {
            if (response.error.description) {
                message.error(response.error.description);
                setIsSending(false);
                return;
            }

            setIsSending(false);
            return handleServiceError(app, response);
        }

        close();
        fetchCompanies();

        setIsSending(false);
    };

    return (
        <Modal
            open
            title="Cadastrar empresa"
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
                name="createCompany"
                layout="vertical"
                autoComplete="off"
            >
                <CompanyFields />
            </Form>
        </Modal>
    );
}
