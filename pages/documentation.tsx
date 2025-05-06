import { Alert, Box, Container, Divider, Grid, Paper, Text } from '@mantine/core';
import Head from 'next/head';

const Documentation = () => (
  <>
    <Head>
      <title>Documentation API | DesignMyPDF</title>
      <meta name="description" content="Documentation sur l'utilisation de l'API DesignMyPDF" />
    </Head>

    <Container size="lg" py="xl">
      <Paper shadow="md" p="xl" mb="md">
        <Text size="xl" fw={700} c="#333" mb="md" component="h1">
          Documentation de l&apos;API DesignMyPDF
        </Text>

        <Text size="md" c="dimmed" mb="xl">
          Apprenez à générer des PDFs dynamiques en quelques minutes avec notre API simple et
          puissante.
        </Text>

        <Divider my="xl" />

        <Box mb="xl">
          <Text size="xl" fw={700} c="#333" mb="md" component="h2">
            Introduction
          </Text>

          <Text mb="md">
            L&apos;API DesignMyPDF vous permet de générer des documents PDF dynamiques à partir de
            templates HTML personnalisés. Cette documentation vous guidera à travers les étapes
            nécessaires pour intégrer notre API dans votre application.
          </Text>

          <Alert color="blue" my="md">
            Pour utiliser l&apos;API, vous aurez besoin d&apos;une clé d&apos;API valide. Vous
            pouvez en obtenir une dans la section &quot;API Keys&quot; de votre tableau de bord.
          </Alert>
        </Box>

        <Box mb="xl">
          <Text size="xl" fw={700} c="#333" mb="md" component="h2">
            Guide rapide
          </Text>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box mb="md">
                <Text size="lg" fw={500} mb="xs">
                  1. Créez un template
                </Text>
                <Text mb="md">
                  Commencez par créer un template HTML avec des variables qui seront remplacées
                  dynamiquement. Notre système utilise le moteur de template Handlebars.
                </Text>
              </Box>

              <Box mb="md">
                <Text size="lg" fw={500} mb="xs">
                  2. Obtenez l&apos;ID du template
                </Text>
                <Text mb="md">
                  Chaque template créé reçoit un identifiant unique. Vous utiliserez cet ID dans vos
                  requêtes API.
                </Text>
              </Box>

              <Box mb="md">
                <Text size="lg" fw={500} mb="xs">
                  3. Envoyez une requête à l&apos;API
                </Text>
                <Text mb="md">
                  Effectuez une requête POST vers notre API avec les données à injecter dans votre
                  template.
                </Text>
              </Box>

              <Box>
                <Text size="lg" fw={500} mb="xs">
                  4. Récupérez le PDF généré
                </Text>
                <Text mb="md">
                  L&apos;API vous retournera une URL vers le PDF généré que vous pourrez télécharger
                  ou afficher à vos utilisateurs.
                </Text>
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper
                shadow="sm"
                p="md"
                style={{
                  backgroundColor: '#f7f7f7',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <Text fw={500} mb="xs">
                  Exemple de requête
                </Text>

                <Box mb="sm">
                  <pre
                    style={{
                      backgroundColor: '#f1f1f1',
                      padding: '10px',
                      borderRadius: '5px',
                      overflowX: 'auto',
                    }}
                  >
                    {`fetch('https://v0s8g4wckkso40ocg8ogk4gk.yvesdavinci.tech/api/generate-pdf/YOUR_TEMPLATE_ID', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'dmp_KEY': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    items: [
      { product: 'Produit A', price: 19.99 },
      { product: 'Produit B', price: 29.99 }
    ]
  })
})
.then(response => response.json())
.then(data => {
  console.log('PDF URL:', data.path);
})
.catch(error => console.error('Erreur:', error));`}
                  </pre>
                </Box>
              </Paper>
            </Grid.Col>
          </Grid>
        </Box>

        <Divider my="xl" />

        <Box mb="xl">
          <Text size="xl" fw={700} c="#333" mb="md" component="h2">
            Point d&apos;accès de l&apos;API
          </Text>

          <Paper shadow="xs" p="md" mb="md" style={{ backgroundColor: '#f5f5f5' }}>
            <Text size="lg" fw={500} mb="xs" component="h3">
              Générer un PDF
            </Text>

            <Text ff="monospace" mb="md">
              POST /generate-pdf/:templateId
            </Text>

            <Text fw={500} mb="xs">
              Paramètres
            </Text>

            <Box mb="md">
              <Text mb="xs">
                <strong>templateId</strong> (URI) - L&apos;identifiant unique du template à utiliser
              </Text>

              <Text mb="xs">
                <strong>format</strong> (Query, optionnel) - Format du PDF (A4, A3, A2, etc.). Par
                défaut: A4
              </Text>

              <Text mb="xs">
                <strong>dmp_KEY</strong> (Header) - Votre clé API
              </Text>

              <Text mb="xs">
                <strong>Body</strong> - Un objet JSON contenant les données à injecter dans le
                template
              </Text>
            </Box>

            <Text fw={500} mb="xs">
              Réponse
            </Text>

            <Box>
              <pre
                style={{
                  backgroundColor: '#f1f1f1',
                  padding: '10px',
                  borderRadius: '5px',
                  overflowX: 'auto',
                }}
              >
                {`{
  "path": "https://storage.backblazeb2.com/file/your-bucket/templates/generated-pdf-file.pdf"
}`}
              </pre>
            </Box>
          </Paper>
        </Box>

        <Box mb="xl">
          <Text size="xl" fw={700} c="#333" mb="md" component="h2">
            Formatage des templates
          </Text>

          <Text mb="md">
            Nos templates utilisent la syntaxe Handlebars. Voici quelques exemples de syntaxe que
            vous pouvez utiliser:
          </Text>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper shadow="xs" p="md" mb="md" style={{ backgroundColor: '#f5f5f5' }}>
                <Text fw={500} mb="xs">
                  Variables simples
                </Text>
                <pre
                  style={{
                    backgroundColor: '#f1f1f1',
                    padding: '10px',
                    borderRadius: '5px',
                    overflowX: 'auto',
                  }}
                >
                  {`<p>Bonjour, {{name}}!</p>
<p>Votre email: {{email}}</p>`}
                </pre>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper shadow="xs" p="md" mb="md" style={{ backgroundColor: '#f5f5f5' }}>
                <Text fw={500} mb="xs">
                  Conditions
                </Text>
                <pre
                  style={{
                    backgroundColor: '#f1f1f1',
                    padding: '10px',
                    borderRadius: '5px',
                    overflowX: 'auto',
                  }}
                >
                  {`{{#if premium}}
  <p>Vous êtes un utilisateur premium!</p>
{{else}}
  <p>Passez au plan premium!</p>
{{/if}}`}
                </pre>
              </Paper>
            </Grid.Col>

            <Grid.Col span={12}>
              <Paper shadow="xs" p="md" mb="md" style={{ backgroundColor: '#f5f5f5' }}>
                <Text fw={500} mb="xs">
                  Boucles
                </Text>
                <pre
                  style={{
                    backgroundColor: '#f1f1f1',
                    padding: '10px',
                    borderRadius: '5px',
                    overflowX: 'auto',
                  }}
                >
                  {`<table>
  <tr>
    <th>Produit</th>
    <th>Prix</th>
  </tr>
  {{#each items}}
  <tr>
    <td>{{this.product}}</td>
    <td>{{this.price}} €</td>
  </tr>
  {{/each}}
</table>`}
                </pre>
              </Paper>
            </Grid.Col>
          </Grid>
        </Box>

        <Box mb="xl">
          <Text size="xl" fw={700} c="#333" mb="md" component="h2">
            Optimisations et bonnes pratiques
          </Text>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box>
                <Text size="lg" fw={500} mb="md">
                  Améliorer les performances
                </Text>

                <ul>
                  <li>
                    <Text mb="xs">
                      <strong>Réutilisez les templates</strong> - Créez des templates réutilisables
                      pour différents scénarios plutôt que de créer un nouveau template pour chaque
                      cas.
                    </Text>
                  </li>
                  <li>
                    <Text mb="xs">
                      <strong>Optimisez les images</strong> - Compressez vos images avant de les
                      inclure dans votre template.
                    </Text>
                  </li>
                  <li>
                    <Text mb="xs">
                      <strong>Limitez les appels API</strong> - Mettez en cache les PDFs générés
                      fréquemment plutôt que de les regénérer à chaque demande.
                    </Text>
                  </li>
                  <li>
                    <Text mb="xs">
                      <strong>Envoyez uniquement les données nécessaires</strong> - N&apos;incluez
                      que les données dont vous avez besoin dans votre requête.
                    </Text>
                  </li>
                </ul>
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box>
                <Text size="lg" fw={500} mb="md">
                  Résolution de problèmes
                </Text>

                <Paper shadow="xs" p="md" mb="md" style={{ backgroundColor: '#fff3e0' }}>
                  <Text fw={500} mb="xs">
                    Erreurs courantes
                  </Text>

                  <ul>
                    <li>
                      <Text mb="xs">
                        <strong>401 Unauthorized</strong> - Vérifiez que votre clé API est valide et
                        correctement envoyée dans l&apos;en-tête &quot;dmp_KEY&quot;.
                      </Text>
                    </li>
                    <li>
                      <Text mb="xs">
                        <strong>400 Bad Request</strong> - Assurez-vous que le format de votre
                        requête est correct et que toutes les données requises sont fournies.
                      </Text>
                    </li>
                    <li>
                      <Text mb="xs">
                        <strong>404 Not Found</strong> - Assurez-vous que le templateId est correct
                        et que toutes les données requises sont fournies.
                      </Text>
                    </li>
                    <li>
                      <Text mb="xs">
                        <strong>429 Too Many Requests</strong> - Vous avez dépassé votre limite
                        d&apos;utilisation. Vérifiez votre quota dans votre tableau de bord.
                      </Text>
                    </li>
                    <li>
                      <Text mb="xs">
                        <strong>500 Internal Server Error</strong> - Une erreur s&apos;est produite
                        côté serveur. Contactez notre support si le problème persiste.
                      </Text>
                    </li>
                  </ul>
                </Paper>
              </Box>
            </Grid.Col>
          </Grid>
        </Box>

        <Divider my="xl" />
      </Paper>
    </Container>
  </>
);

export default Documentation;
