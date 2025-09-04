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

const cacheTypeParams: Record<string, { key: string; label: string }[]> = {
  redis: [
    { key: "host", label: "Host" },
    { key: "port", label: "Port" },
  ],
  qdrant: [
    { key: "host", label: "Host" },
    { key: "port", label: "Port" },
  ],
  redis_semantic: [
    { key: "host", label: "Host" },
    { key: "port", label: "Port" },
  ],
  s3: [
    { key: "bucket", label: "Bucket" },
    { key: "region", label: "Region" },
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

