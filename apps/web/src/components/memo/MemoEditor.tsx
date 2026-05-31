import { useState, useEffect } from 'react'
import { IconMapPin, IconX } from '@tabler/icons-react'
import Spinner from '../common/Spinner'
import type { LocalMemo } from '../../types/localMemo'

interface MemoEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, body: string, location: { lat: number | null; lng: number | null; label: string | null }) => void
  initial?: LocalMemo | null
}

async function fetchReverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`,
      { headers: { 'Accept-Language': 'ko' } },
    )
    const data = await res.json()
    const addr = data.address ?? {}
    return addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? addr.city_district ?? addr.city ?? '현재 위치'
  } catch {
    return '현재 위치'
  }
}

export default function MemoEditor({ isOpen, onClose, onSave, initial }: MemoEditorProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null; label: string | null }>({
    lat: null, lng: null, label: null,
  })

  useEffect(() => {
    if (isOpen) {
      setTitle(initial?.title ?? '')
      setBody(initial?.body ?? '')
      setLocation(initial?.location ?? { lat: null, lng: null, label: null })
      setLocationLoading(false)
    }
  }, [isOpen, initial])

  function handleGetLocation() {
    if (!navigator.geolocation) return
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const label = await fetchReverseGeocode(pos.coords.latitude, pos.coords.longitude)
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label })
        setLocationLoading(false)
      },
      () => {
        setLocation({ lat: null, lng: null, label: '위치 권한 없음' })
        setLocationLoading(false)
      },
    )
  }

  function handleSave() {
    if (!body.trim()) return
    onSave(title.trim(), body.trim(), location)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.2)' }}
      onClick={onClose}
    >
      <div
        className="w-[480px] max-h-[80vh] flex flex-col rounded-xl shadow-lg border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="text-[12px] font-medium">{initial ? '메모 편집' : '새 메모'}</span>
          <button onClick={onClose} className="p-0.5 rounded hover:bg-black/5">
            <IconX size={14} style={{ color: 'var(--color-muted)' }} />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-4 py-3.5 flex-1 overflow-auto">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목 (선택)"
            className="text-[12px] font-medium outline-none border-b pb-2"
            style={{ borderColor: 'var(--color-border)', color: '#1a1a18' }}
          />

          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="내용을 입력하세요&#10;&#10;날짜/시간이 포함되면 알람을 자동으로 감지해요"
            rows={8}
            className="text-[11px] leading-relaxed outline-none resize-none"
            style={{ color: '#1a1a18' }}
            autoFocus={!initial}
          />

          <div className="flex items-center gap-2">
            {location.label ? (
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px]"
                style={{ background: 'var(--color-surface-2)' }}
              >
                <IconMapPin size={11} style={{ color: 'var(--color-primary)' }} />
                <span>{location.label}</span>
                <button
                  onClick={() => setLocation({ lat: null, lng: null, label: null })}
                  className="ml-0.5"
                >
                  <IconX size={10} style={{ color: 'var(--color-muted)' }} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] border transition-colors disabled:opacity-50"
                style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
              >
                {locationLoading ? <Spinner size="sm" /> : <IconMapPin size={11} />}
                {locationLoading ? '위치 가져오는 중…' : '위치 태그'}
              </button>
            )}
          </div>
        </div>

        <div
          className="flex justify-end gap-1.5 px-4 py-2.5 border-t flex-shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={onClose}
            className="text-[10px] px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!body.trim()}
            className="text-[10px] px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
