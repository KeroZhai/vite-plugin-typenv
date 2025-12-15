import { defineDefaultVariables } from 'vite-plugin-typenv'

export default defineDefaultVariables({
  VITE_APP_NAME: 'Vite App',
  VITE_APP_TITLE: '$VITE_APP_NAME',
  VITE_USERNAME: 'Keroz',
  VITE_MESSAGE: 'Hi, \\$VITE_USERNAME!',
})
