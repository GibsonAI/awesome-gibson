#!/usr/bin/env python
import sys

from src.crew import SalesContactFinderCrew

# This main file is intended to be a way for your to run your
# crew locally, so refrain from adding necessary logic into this file.
# Replace with inputs you want to test with, it will automatically
# interpolate any tasks and agents information


def run():
    # Create an instance of the crew
    crew = SalesContactFinderCrew()

    # Define your inputs
    target_company = input("Enter Target Company: ")
    our_product = input("Describe out product: ")

    inputs = {"target_company": target_company, "our_product": our_product}

    # Execute the crew with the inputs
    result = crew.crew().kickoff(inputs)

    # Print the results
    print("\nResults:")
    print(result)


def train():
    """
    Train the crew for a given number of iterations.
    """
    inputs = {"topic": "AI LLMs"}
    try:
        SalesContactFinderCrew().crew().train(
            n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs
        )

    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")


def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        SalesContactFinderCrew().crew().replay(task_id=sys.argv[1])

    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")


def test():
    """
    Test the crew execution and returns the results.
    """
    inputs = {"topic": "AI LLMs"}
    try:
        SalesContactFinderCrew().crew().test(
            n_iterations=int(sys.argv[1]), openai_model_name=sys.argv[2], inputs=inputs
        )

    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please specify a command: run, train, test, or replay")
        sys.exit(1)

    command = sys.argv[1]

    if command == "run":
        run()
