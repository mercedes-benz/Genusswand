import React from 'react';
import {Typography, Box, Tabs, Tab} from '@mui/material';

const About: React.FC = () => {
    return (
        <Box sx={{p: 3}}>
            <Typography variant="h4">About Us</Typography>
            <Typography variant="body1" sx={{mt: 2}}>
                Welcome to the digital indulgence wall – the most fun and delightful way to celebrate (or atone for, depending on your perspective) small everyday sins in the office. Here, every mishap, faux pas, and reckless action becomes an opportunity to make the team smile and the stomach rejoice.
            </Typography>
            <br/>
            <Typography variant="h5">
                What is the indulgence wall?
            </Typography>
            <Typography variant="body1" sx={{mt: 2}}>
                The indulgence wall is more than just a collection of marks – it is a place of community, joy, and collective calorie-building. In the past, handwritten marks adorned our office wall, but the digital age has arrived here as well. Now, the indulgence wall is online and ready to turn even the smallest mishap into the highlight of the day.

                Forgot a client meeting? Bam, a mark. Didn't descale the coffee machine? Mark. Made the legendary "Reply All" mistake? Congratulations, that's a mark too! But don't worry – every mark is not the end, but the beginning of a delightful atonement.
            </Typography>
            <br/>
            <Typography variant="h5">
                How does it work?
            </Typography>

            <Typography variant="body1" sx={{mt: 2}}>
                The rules are simple:
                <br/>
                1. Misstep: You make a small mistake – be it a spilled coffee, a forgotten appointment, or a particularly bad joke in the team meeting.
                <br/>
                2. Mark: Your misstep is "rewarded" with a mark on the indulgence wall.
                <br/>
                3. Atonement: Each mark can be atoned for with a treat. Cake, cookies, muffins – the sky's the limit. The main thing is that it brings a smile to your colleagues' faces (and fills the break room with calories).
            </Typography>

            <br/>
            <Typography variant="h5">
                Why is the indulgence wall good?
            </Typography>
            <Typography variant="body1" sx={{mt: 2}}>
                The indulgence wall is not just a humorous gimmick, but also a real team player. It turns small mistakes into sweet highlights and ensures that the office atmosphere remains relaxed. Instead of getting annoyed about mishaps, we look forward to the next treat. It also fosters creativity: from homemade banana bread to artfully decorated donuts – every atonement is a small culinary masterpiece. Additionally, it promotes team cohesion: nothing brings a team together more than sharing a chocolate cake.
            </Typography>

            <br/>

            <Typography variant="h5">
                Why digital?
            </Typography>
            <Typography variant="body1" sx={{mt: 2}}>
                Because we like to stay up to date and no one wants to search for a missing chalk stick anymore. Our digital indulgence wall is always at hand, clear, and – best of all – anonymizes the missteps on request to turn embarrassing moments into sweet memories.
            </Typography>

            <br/>

            <Typography variant="h5">
                The true indulgence
            </Typography>
            <Typography variant="body1" sx={{mt: 2}}>
                The indulgence wall is not just a system, but a way of life. It shows us that mistakes are human and that they can be made up for with a smile and a piece of cake. So, if you're wondering why it always smells like freshly baked apple pie here or why there's a fight over the last chocolate croissant in the break room – now you know. We invite you to be part of this humorous ritual. Be ready to make mistakes, collect marks, and perfect the art of indulgence. Because at the end of the day, it's not the mark that counts, but the cake that erases it. In this spirit: Happy indulging and have fun with the indulgence wall!
            </Typography>
        </Box>
    );
};

export default About;
