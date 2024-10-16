
import { handler } from '../../src/storeRates'

handler({}).then(() => console.log('Stored rates')).catch(console.error)