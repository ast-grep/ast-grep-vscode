// import {
//   Flex,
//   Link,
//   Text,
//   Heading,
//   UnorderedList,
//   ListItem,
// } from '@chakra-ui/react'
// import { CodeBlock } from '../../components/CodeBlock'

// export function TextModeNoResults() {
//   return (
//     <Flex flexDir="column" maxW="600px" py="50px">
//       <Text size="md" textAlign="center">
//         No results found.
//       </Text>
//       <Heading mb="5" mt="50px" size="lg">
//         About text search mode
//       </Heading>
//       <Text my="1">
//         Text mode supports searching in every type of text file.
//       </Text>
//       <Text my="1">
//         It transforms the query into special regular expression making search
//         whitespace agnostic.
//       </Text>
//       <Text my="1">
//         It's great for simple search or to make initial discovery before using
//         structural search modes.
//       </Text>
//       <Text my="4">Wildcards available in text search mode:</Text>
//       <UnorderedList>
//         <ListItem>
//           <CodeBlock>$$</CodeBlock> - 0 or more chars in the same line,
//         </ListItem>
//         <ListItem>
//           <CodeBlock>$$m</CodeBlock> - 0 or more chars <b>m</b>ultiline,
//         </ListItem>
//         <ListItem>
//           <CodeBlock>$$$</CodeBlock> - 1 or more chars in the same line,
//         </ListItem>
//         <ListItem>
//           <CodeBlock>$$$m</CodeBlock> - 1 or more chars <b>m</b>ultiline.
//         </ListItem>
//       </UnorderedList>
//       <Link
//         my="4"
//         href="https://codeque.co/docs?utm_source=vscode_text-search-results#text-search-mode"
//         target="_blank"
//         color="var(--vscode-textLink-foreground);"
//       >
//         👉 Learn more about text search mode
//       </Link>
//     </Flex>
//   )
// }
