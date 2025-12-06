import { defineDefaultVariables } from 'vite-plugin-typenv'

export default defineDefaultVariables({
  VITE_APP_TITLE: 'Vite App',
  VITE_USERNAME: 'Keroz',
  VITE_MESSAGE: 'Hi, \\$VITE_USERNAME!',
})
