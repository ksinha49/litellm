import React, { useState } from "react";
import { Card, Title } from "@tremor/react";
import { Modal } from "antd";
import { ExpandAltOutlined } from "@ant-design/icons";

interface ExpandableChartCardProps {
  title: string;
  children: (expanded: boolean) => React.ReactNode;
  className?: string;
}

const ExpandableChartCard: React.FC<ExpandableChartCardProps> = ({
  title,
  children,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Card
        className={className}
        style={{ borderRadius: 4, border: "1px solid #cccccc" }}
      >
        <div className="flex items-center justify-between mb-2">
          <Title>{title}</Title>
          <button
            onClick={() => setExpanded(true)}
            className="p-1.5 rounded transition-colors"
            style={{ color: "#8c8c8c" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0058db")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8c8c8c")}
            title="Expand"
          >
            <ExpandAltOutlined style={{ fontSize: 16 }} />
          </button>
        </div>
        {children(false)}
      </Card>

      <Modal
        title={title}
        open={expanded}
        onCancel={() => setExpanded(false)}
        footer={null}
        width="90vw"
        style={{ maxWidth: 1200, top: 40 }}
        destroyOnClose
      >
        {children(true)}
      </Modal>
    </>
  );
};

export default ExpandableChartCard;
