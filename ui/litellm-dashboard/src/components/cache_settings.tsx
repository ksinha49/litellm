import React, { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Switch,
  Select,
  SelectItem,
  TextInput,
  Button,
} from "@tremor/react";
import {
  getCacheConfig,
  updateCacheConfig,
  cachingHealthCheckCall,
} from "./networking";
import NotificationsManager from "./molecules/notifications_manager";

interface CacheSettingsProps {
  accessToken: string | null;
}

const cacheTypeOptions = [
  "redis",
  "disk",
  "in_memory",
  "s3",
  "qdrant",
  "redis_semantic",
];

interface CacheParamField {
  key: string;
  label: string;
  type?: 'text' | 'url' | 'email' | 'password';
  placeholder?: string;
}

const cacheTypeParams: Record<string, CacheParamField[]> = {
  redis: [
    { key: "host", label: "Host" },
    { key: "port", label: "Port" },
    {
      key: "password",
      label: "Password",
      type: "password",
      placeholder: "os.environ/REDIS_PASSWORD",
    },
  ],
  qdrant: [
    { key: "host", label: "Host" },
    { key: "port", label: "Port" },
  ],
  redis_semantic: [
    { key: "host", label: "Host" },
    { key: "port", label: "Port" },
    {
      key: "password",
      label: "Password",
      type: "password",
      placeholder: "os.environ/REDIS_PASSWORD",
    },
  ],
  s3: [
    { key: "s3_bucket_name", label: "Bucket" },
    { key: "s3_region_name", label: "Region" },
    {
      key: "s3_aws_access_key_id",
      label: "AWS Access Key ID",
      type: "password",
      placeholder: "os.environ/AWS_ACCESS_KEY_ID",
    },
    {
      key: "s3_aws_secret_access_key",
      label: "AWS Secret Access Key",
      type: "password",
      placeholder: "os.environ/AWS_SECRET_ACCESS_KEY",
    },
    {
      key: "s3_aws_session_token",
      label: "AWS Session Token",
      type: "password",
      placeholder: "os.environ/AWS_SESSION_TOKEN",
    },
  ],
  disk: [{ key: "cache_dir", label: "Cache Directory" }],
  in_memory: [],
};

export const CacheSettings: React.FC<CacheSettingsProps> = ({ accessToken }) => {
  const [cacheEnabled, setCacheEnabled] = useState(false);
  const [cacheType, setCacheType] = useState<string>("redis");
  const [params, setParams] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    getCacheConfig(accessToken)
      .then((data) => {
        if (data?.cache !== undefined) {
          setCacheEnabled(data.cache);
        }
        const cp = data?.cache_params || {};
        setCacheType(cp.type || "redis");
        setParams(cp);
      })
      .catch(() => {});
  }, [accessToken]);

  const handleParamChange = (key: string, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!accessToken) return;
    setSaving(true);
    try {
      await updateCacheConfig(accessToken, "cache", cacheEnabled);
      const paramsWithType = { ...params, type: cacheType };
      await updateCacheConfig(accessToken, "cache_params", paramsWithType);
      const ping = await cachingHealthCheckCall(accessToken);
      if (ping?.ping_response || ping?.status === "ok") {
        NotificationsManager.success("Cache settings updated successfully");
      } else {
        NotificationsManager.fromBackend("Cache ping failed");
      }
    } catch (e) {
      NotificationsManager.fromBackend(e as any);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <Title>Cache Settings</Title>
      <div className="space-y-4 mt-4">
        <div className="flex items-center gap-2">
          <Text>Enable Caching</Text>
          <Switch checked={cacheEnabled} onChange={setCacheEnabled} />
        </div>
        <div>
          <Text className="mb-1">Cache Type</Text>
          <Select value={cacheType} onValueChange={(value) => setCacheType(value)}>
            {cacheTypeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>
        </div>
        {cacheTypeParams[cacheType]?.map((field) => (
          <div key={field.key}>
            <Text className="mb-1">{field.label}</Text>
            <TextInput
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              value={params[field.key] ?? ""}
              onChange={(e) => handleParamChange(field.key, e.target.value)}
            />
          </div>
        ))}
        <Button onClick={handleSave} loading={saving}>
          Save
        </Button>
      </div>
    </Card>
  );
};

export default CacheSettings;

