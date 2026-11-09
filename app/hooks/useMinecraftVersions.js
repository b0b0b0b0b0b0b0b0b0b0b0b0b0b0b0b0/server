'use client';

import { useEffect, useRef, useState } from 'react';

let globalVersions = null;
let globalLoading = false;
let globalPromise = null;

const EMPTY_VERSIONS = { release: [], full: [], entries: [] };

export function useMinecraftVersions() {
  const [versions, setVersions] = useState(() => {
    if (typeof window !== 'undefined' && window.__MC_VERSIONS__) {
      globalVersions = window.__MC_VERSIONS__;
      return window.__MC_VERSIONS__;
    }
    return globalVersions || EMPTY_VERSIONS;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && window.__MC_VERSIONS__) {
      return false;
    }
    return !globalVersions;
  });
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return undefined;
    mountedRef.current = true;

    if (typeof window !== 'undefined' && window.__MC_VERSIONS__) {
      globalVersions = window.__MC_VERSIONS__;
      setVersions(window.__MC_VERSIONS__);
      setLoading(false);
      return undefined;
    }

    if (globalVersions) {
      setVersions(globalVersions);
      setLoading(false);
      return undefined;
    }

    if (globalPromise) {
      globalPromise.then((data) => {
        setVersions(data);
        setLoading(false);
      });
      return undefined;
    }

    if (globalLoading) {
      const checkInterval = setInterval(() => {
        if (globalVersions) {
          setVersions(globalVersions);
          setLoading(false);
          clearInterval(checkInterval);
        }
      }, 50);
      return () => clearInterval(checkInterval);
    }

    globalLoading = true;
    globalPromise = fetch('/api/mc-versions')
      .then((res) => res.json())
      .then((data) => {
        globalVersions = data;
        globalLoading = false;
        globalPromise = null;
        if (typeof window !== 'undefined') {
          window.__MC_VERSIONS__ = data;
        }
        return data;
      })
      .catch(() => {
        globalLoading = false;
        globalPromise = null;
        return EMPTY_VERSIONS;
      });

    globalPromise.then((data) => {
      setVersions(data);
      setLoading(false);
    });

    return undefined;
  }, []);

  return { ...versions, loading };
}
