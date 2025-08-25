/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-unresolved
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Form } from "antd";
import SSOModals from "./SSOModals";

const meta: Meta<typeof SSOModals> = {
  title: "Components/SSOModals",
  component: SSOModals,
};

export default meta;

type Story = StoryObj<typeof SSOModals>;

export const ResetConfigured: Story = {
  render: () => {
    const Demo = () => {
      const [form] = Form.useForm();
      return (
        <SSOModals
          isAddSSOModalVisible={true}
          isInstructionsModalVisible={false}
          handleAddSSOOk={() => {}}
          handleAddSSOCancel={() => {}}
          handleShowInstructions={() => {}}
          handleInstructionsOk={() => {}}
          handleInstructionsCancel={() => {}}
          form={form}
          accessToken={null}
          ssoConfigured={true}
        />
      );
    };
    return <Demo />;
  },
};
