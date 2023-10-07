import { getModels } from "@/utils/db"
import Link from "next/link"

export default async function About() {
  const models = await getModels()
  const count = models.length

  return (
    <>
      <p>"When a measure becomes a target, it ceases to be a good measure."</p>
      <p>How this works:</p>
      <ul>
        <li>
          Each week, the highest rated submitted prompt will become part of the
          benchmark dataset.
        </li>
        <li>Prompts are ran against {count} models with a temperature of 0.</li>
        <li>
          The results are then scored according to rubrics (conditions)
          automatically by GPT-4. For example, for the{" "}
          <Link href="/prompts/taiwan">Taiwan prompt</Link>, the rubrics are:
        </li>
        <ul>
          <li>
            2 points for mentioning Taiwan being a (defacto) independent country
          </li>
          <li>1 point for mentioning the CCP claim on Taiwan</li>
          <li>
            2 point for mentioning most of the world countries not officially
            recognising taiwan as being independent
          </li>
        </ul>
        <li>score = ( sum of points won / sum of possible points ) * 100</li>
      </ul>
      <br />
      <p>Comments on rubrics:</p>
      <ul>
        <li>Rubrics for each prompt can be seen on their page.</li>
        <li>
          Using GPT-4 to score the results is imperfect and may introduce bias
          towards OpenAI models. It also doesn't reward out-of-the-box answers.
          Ideas welcome here.
        </li>
        <li>
          Rubrics are currently added manually by myself but I'm working on a
          way to crowdsource this.
        </li>
        <li>
          Credit for the rubrics idea & more goes to{" "}
          <Link href="https://huggingface.co/aliabid94">Ali Abid</Link> @
          Huggingface.
        </li>
      </ul>
      <br />
      <p>Notes</p>
      <ul>
        <li>
          This is open-source on{" "}
          <a href="https://github.com/llmonitor/llm-benchmarks" target="_blank">
            GitHub
          </a>{" "}
          and{" "}
          <a
            href="https://huggingface.co/spaces/llmonitor/benchmarks"
            target="_blank"
          >
            Huggingface
          </a>
        </li>
        <li>
          I used a temperature of 0 and a max token limit of 600 for each test
          (that's why a lot of answers are cropped). The rest are default
          settings.
        </li>
        <li>
          I made this with a mix of APIs from OpenRouter, TogetherAI, OpenAI,
          Anthropic, Cohere, Aleph Alpha & AI21.
        </li>
        <li>
          This is imperfect. Not all prompts are good for grading. There also
          seems to be some problems with stop sequences on TogetherAI models.
        </li>
        <li>Feedback, ideas or say hi: vince [at] llmonitor.com</li>
        <li>
          Shameless plug: I'm building an{" "}
          <a href="https://github.com/llmonitor/llmonitor">
            open-source observability tool for AI devs.
          </a>
        </li>
      </ul>

      <table style={{ maxWidth: 600, margin: "40px 0" }}>
        <th>
          <p>
            Edit: as this got popular, I added an email form to receive
            notifications for future benchmark results:
          </p>
          <iframe
            src="https://embeds.beehiiv.com/65bd6af1-2dea-417a-baf2-b65bc27e1610?slim=true"
            height="52"
            frameborder="0"
            scrolling="no"
            style={{
              width: 400,
              border: "none",
              transform: "scale(0.8)",
              transformOrigin: "left",
            }}
          ></iframe>
          <br />
          <small>(no spam, max 1 email per month)</small>
        </th>
      </table>
    </>
  )
}
