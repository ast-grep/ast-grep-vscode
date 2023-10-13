// import {
//   Flex,
//   Link,
//   Text,
//   Heading,
//   UnorderedList,
//   ListItem,
// } from '@chakra-ui/react'
// import { CodeBlock } from '../../components/CodeBlock'

// export function StructuralModeNoResults() {
//   return (
//     <Flex flexDir="column" maxW="600px" py="50px">
//       <Text size="md" textAlign="center">
//         No results found.
//       </Text>
//       <Heading mb="5" mt="50px" size="lg">
//         About structural search modes
//       </Heading>
//       <Text my="1">
//         Structural modes supports searching only in{' '}
//         <b>JavaScript, TypeScript, JSON, HTML and CSS source files.</b>
//       </Text>
//       <Text my="1">
//         They are powerful tool for advanced search allowing for finding complex
//         code patterns.
//       </Text>
//       <Text my="4">There are 3 types of structural search modes:</Text>
//       <UnorderedList>
//         <ListItem>
//           <b>include</b> - Most flexible search mode allowing to skip properties
//           or statements in code blocks in query. The order of properties or
//           statements does not matter. Use it to expand your search.
//         </ListItem>
//         <ListItem mt="1.5">
//           <b>include-with-order</b> - Works similarly to include mode, but
//           preserves the order of properties or statements while matching
//           results.
//         </ListItem>
//         <ListItem mt="1.5">
//           <b>exact</b> - Strict search mode that just much code as it is written
//           in query. It effectively gives similar results to text search mode.
//           But since it perform structural comparison, wildcards works
//           differently and are more accurate and powerful.
//         </ListItem>
//       </UnorderedList>
//       <Text my="4">
//         Query in structural search modes has to be valid source code. Query is
//         parsed into AST and then matched against source files using curated
//         algorithm to make it easy to use.
//       </Text>
//       <Text my="4">Wildcards available in structural search modes:</Text>
//       <UnorderedList>
//         <ListItem>
//           <CodeBlock>$$</CodeBlock> - Identifier wildcard,
//         </ListItem>
//         <ListItem>
//           <CodeBlock>$$$</CodeBlock> - statement/expression wildcard,
//         </ListItem>
//         <ListItem>
//           <CodeBlock>"$$"</CodeBlock> - string with 0 or more characters,
//         </ListItem>
//         <ListItem>
//           <CodeBlock>"$$$"</CodeBlock> - string with 1 or more characters,
//         </ListItem>
//         <ListItem>
//           <CodeBlock>0x0</CodeBlock> - number wildcard.
//         </ListItem>
//       </UnorderedList>
//       <Text my="4" as="i" textStyle="italic">
//         CodeQue will support more programming languages in future. You can
//         comment in{' '}
//         <Link
//           href="https://github.com/codeque-co/codeque/issues/7"
//           target="_blank"
//           color="var(--vscode-textLink-foreground);"
//         >
//           this issue
//         </Link>
//         , so I know which ones to prioritize.
//       </Text>
//       <Link
//         my="1"
//         href="https://codeque.co/docs?utm_source=vscode_text-search-results#include-search-mode"
//         target="_blank"
//         color="var(--vscode-textLink-foreground);"
//       >
//         👉 Learn more about structural search modes
//       </Link>
//     </Flex>
//   )
// }
