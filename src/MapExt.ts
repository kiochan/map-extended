/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/method-signature-style */
import { isEqual } from 'underscore'

type CompareCallback<K = any, V = any> = (key: K, value: V) => boolean
type MappingCallback<K = any, V = any, R = any> = (key: K, value: V) => R
type MapItem<K, V> = [K, V]

const bindFnName = ['find', 'some', 'every', 'map'] as const

const bindFn = function <K, V>(fnName: keyof typeof bindFnName) {
  return function (
    this: Map<K, V>,
    callback: (key: any, value: any) => any
  ): any {
    const entries = this.entries()
    const arr = Array.from(entries)
    return (arr[fnName] as any)(([k, v]: any) => callback(k, v))
  }
}

declare global {
  interface Map<K, V> {
    setn(key: K, value: V): this
    deln(key: K): this
    getKey(value: V): K | undefined
    getValue(key: K): V | undefined
    hasKey(key: K): boolean
    hasValue(value: V): boolean
    find(callback: CompareCallback<K, V>): MapItem<K, V> | undefined
    some(callback: CompareCallback<K, V>): boolean
    every(callback: CompareCallback<K, V>): boolean
    filter(callback: CompareCallback<K, V>): Map<K, V>
    map<T>(callback: MappingCallback<K, V, T>): T[]
    compareObject(k1: K, k2: K): boolean
  }
}

Map.prototype.setn = function (key: any, value: any) {
  const [oldKey] = this.find((k) => this.compareObject(k, key)) ?? [
    undefined,
    undefined
  ]
  this.set(oldKey, value)
  return this
}

Map.prototype.deln = function (key: any) {
  const [oldKey] = this.find((k) => this.compareObject(k, key)) ?? [
    undefined,
    undefined
  ]
  this.delete(oldKey)
  return this
}

Map.prototype.hasKey = function (key: any) {
  return Boolean(this.find((k) => this.compareObject(k, key)))
}

Map.prototype.hasValue = function (value: any) {
  return Boolean(this.find((_, v) => this.compareObject(v, value)))
}

Map.prototype.getKey = function (value: any) {
  return this.find((_, v) => this.compareObject(v, value))?.[0]
}

Map.prototype.getValue = function (key: any) {
  return this.find((k) => this.compareObject(k, key))?.[1]
}

// 设置 'find', 'some', 'every', 'map' 方法
bindFnName.forEach((fnName) => {
  Map.prototype[fnName] = bindFn(fnName)
})

Map.prototype.filter = function <K, V>(
  callback: CompareCallback<K, V>
): Map<K, V> {
  return new Map<K, V>(bindFn('filter').bind(this)(callback))
}

Map.prototype.compareObject = function (obj1: any, obj2: any) {
  // 如果任何一方是 undefined 则不相等
  if (obj1 === undefined || obj2 === undefined) {
    return false
  }
  return isEqual(obj1, obj2)
}
