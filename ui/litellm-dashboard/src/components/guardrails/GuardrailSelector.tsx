import React, { useEffect, useState, useCallback } from 'react';
import { Select, Typography, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Guardrail } from './types';
import { getGuardrailsList } from '../networking';

interface GuardrailSelectorProps {
  onChange: (selectedGuardrails: string[]) => void;
  value?: string[];
  className?: string;
  accessToken: string;
}

const GuardrailSelector: React.FC<GuardrailSelectorProps> = ({
  onChange,
  value,
  className,
  accessToken
}) => {
  const [guardrails, setGuardrails] = useState<Guardrail[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGuardrails = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await getGuardrailsList(accessToken);
      console.log("Guardrails response:", response);
      if (response.guardrails) {
        console.log("Guardrails data:", response.guardrails);
        setGuardrails(response.guardrails);
      }
    } catch (error) {
      console.error("Error fetching guardrails:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchGuardrails();
  }, [fetchGuardrails]);

  // Add event listener for focus to refresh guardrails when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      fetchGuardrails();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchGuardrails]);

  const handleGuardrailChange = (selectedValues: string[]) => {
    console.log("Selected guardrails:", selectedValues);
    onChange(selectedValues);
  };

  return (
    <div>
      <Select
        mode="multiple"
        placeholder="Select guardrails"
        onChange={handleGuardrailChange}
        value={value}
        loading={loading}
        className={className}
        options={guardrails.map(guardrail => {
          console.log("Mapping guardrail:", guardrail);
          return {
            label: `${guardrail.guardrail_name}`,
            value: guardrail.guardrail_name,
          }
        })}
        optionFilterProp="label"
        showSearch
        allowClear
        onDropdownVisibleChange={(open) => {
          // Refresh guardrails list when dropdown is opened
          if (open) {
            fetchGuardrails();
          }
        }}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default GuardrailSelector; 