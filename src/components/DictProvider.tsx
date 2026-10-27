'use client'

import { createContext, useContext } from 'react'
import { getDict, type Dict, type Locale } from '@/data/dictionary'
import { SLOT_FALLBACKS } from '@/data/photo-slots'

/**
 * The resolved site copy, handed from the server to every client component.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY CONTEXT AND NOT PROPS
 * ═══════════════════════════════════════════════════════════════════
 * 28 components read the dictionary and 17 of them are client components,
 * several nested three or four levels below the page. Threading a `dict` prop
 * through all of that would touch every intermediate component that does not
 * care about copy, purely to pass it along.
 *
 * It also cannot be read directly: the store is server-only, and a client
 * component that imported the static dictionary while the server rendered the
 * edited one would hydrate into a mismatch. The server resolves once, at the
 * layout, and everything below reads the same object.
 *
 * The fallback is the shipped dictionary, so a component rendered outside the
 * provider — a test, or a route that has not been wrapped — still gets real
 * copy instead of undefined.
 */
const DictContext = createContext<Dict | null>(null)

export function DictProvider({
  dict,
  children,
}: {
  dict: Dict
  children: React.ReactNode
}) {
  return <DictContext.Provider value={dict}>{children}</DictContext.Provider>
}

export function useDict(locale: Locale): Dict {
  return useContext(DictContext) ?? getDict(locale)
}

/**
 * Photo slots, resolved on the server and read by client components.
 *
 * Shares this file with the dictionary because it has exactly the same
 * constraint and the same fix: the store is server-only, so a client component
 * cannot resolve a slot itself, and reading the shipped fallback while the
 * server rendered the owner's choice would hydrate into a mismatch.
 */
const ImagesContext = createContext<Record<string, string> | null>(null)

export function ImagesProvider({
  images,
  children,
}: {
  images: Record<string, string>
  children: React.ReactNode
}) {
  return <ImagesContext.Provider value={images}>{children}</ImagesContext.Provider>
}

/** The frame id for `slot`, falling back to the shipped choice. */
export function useImage(slot: string): string {
  const map = useContext(ImagesContext)
  return map?.[slot] ?? SLOT_FALLBACKS[slot] ?? ''
}
