/// <reference types="vite/client" />

declare module '*.ts?worker&url' {
  const src: string
  export default src
}
