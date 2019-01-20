# Bedrock.js
(aiming to be) A blazingly fast multiplayer server for Minecraft Bedrock written in JavaScript / TypeScript

##### _"But JavaScript is so slow"_
It seems to be a popular opinion that JavaScript isn't performant enough to be used as a game server. This project was created in an attempt to disprove that. You see, it's incredibly easy to point fingers at a language and laugh but, when you give it a little more thought, you realise that JavaScript, specifically Node.js, has great potential.

A lot of these opinions are immediately backed up by _"...because JavaScript isn't compiled"_, which, in the case of running a Node.js server, is simply incorrect. When you start the server, [Google's V8](https://v8.dev) not only compiles the entire codebase, it also uses it's dictionary of fast, pre-compiled code fragments to optimise your code - [Read More](https://hashnode.com/post/is-nodejs-compiled-or-interpreted-language-cijylh0ed00keco5318e1em8p/answer/cijyq66au00kvvm53iky4den4).

If you'd like to compare Node.js to Java, take a look at [this article](https://hashnode.com/post/is-nodejs-compiled-or-interpreted-language-cijylh0ed00keco5318e1em8p/answer/cijyq66au00kvvm53iky4den4), it does a great job at explaining the pros of each. But, if you can't bring yourself to read the article, here's a small snippet for you:
> Where Node.js wins: Speed\
\
People love to praise the speed of Node.js. The data comes in and the answers come out like lightning. Node.js doesn’t mess around with setting up separate threads with all of the locking headaches. There’s no overhead to slow down anything. You write simple code and Node.js takes the right step as quickly as possible.

#### Credits
Without the following repositories as a constant reference, this project would not be possible. Thank you to each and every person who has contributed to any of them, you're all amazing :heart:.

- NukkitX ([NukkitX/Network](https://github.com/NukkitX/Network), [NukkitX/Nukkit](https://github.com/NukkitX/Nukkit))
- PocketNode ([PocketNode/RakNet](https://github.com/PocketNode/RakNet), [PocketNode/PocketNode](https://github.com/PocketNode/PocketNode))
- GoMint ([GoMint/jRakNet](https://github.com/GoMint/jRakNet), [GoMint/GoMint](https://github.com/GoMint/GoMint))
- PMMP ([pmmp/RakLib](https://github.com/pmmp/RakLib), [pmmp/PocketMine-MP](https://github.com/pmmp/PocketMine-MP))
- falkirks ([falkirks/DirtServer](https://github.com/falkirks/DirtServer))

#### Links
- [Discord](https://discord.gg/W2KZBzC)
- [Subscribe to PewDiePie](https://www.youtube.com/user/PewDiePie)
