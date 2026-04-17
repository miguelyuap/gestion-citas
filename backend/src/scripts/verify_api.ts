import axios from 'axios';

async function verifyAPI() {
    try {
        console.log('🔍 Checking API Health...');
        const providersRes = await axios.get('http://localhost:3000/api/providers');
        console.log('✅ Providers API:', providersRes.status);
        console.log('Data count:', providersRes.data.data.length);

        if (providersRes.data.data.length > 0) {
            const providerId = providersRes.data.data[0].id;
            console.log(`🔍 Checking TimeSlots for Provider ID: ${providerId}`);

            const slotsRes = await axios.get(`http://localhost:3000/api/timeslots/available/${providerId}`);
            console.log('✅ TimeSlots API:', slotsRes.status);
            console.log('TimeSlots count:', slotsRes.data.data.length);

            if (slotsRes.data.data.length > 0) {
                console.log('Sample Slot:', JSON.stringify(slotsRes.data.data[0], null, 2));
            } else {
                console.log('⚠️ No timeslots found for this provider.');
            }
        }
    } catch (error: any) {
        console.error('❌ API Check failed:', error.message);
        if (error.response) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

verifyAPI();
